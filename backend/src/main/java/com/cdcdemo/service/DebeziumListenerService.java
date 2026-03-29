package com.cdcdemo.service;

import com.cdcdemo.dto.CdcEvent;
import io.debezium.config.Configuration;
import io.debezium.embedded.Connect;
import io.debezium.engine.DebeziumEngine;
import io.debezium.engine.RecordChangeEvent;
import io.debezium.engine.format.ChangeEventFormat;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.apache.kafka.connect.data.Field;
import org.apache.kafka.connect.data.Struct;
import org.apache.kafka.connect.source.SourceRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;

@Service
public class DebeziumListenerService {

    private static final Logger log = LoggerFactory.getLogger(DebeziumListenerService.class);

    private final Configuration debeziumConfiguration;
    private final ExecutorService executorService;
    private final SimpMessagingTemplate messagingTemplate;

    private DebeziumEngine<RecordChangeEvent<SourceRecord>> engine;

    public DebeziumListenerService(Configuration debeziumConfiguration,
                                   ExecutorService executorService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.debeziumConfiguration = debeziumConfiguration;
        this.executorService = executorService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostConstruct
    public void start() {
        engine = DebeziumEngine
                .create(ChangeEventFormat.of(Connect.class))
                .using(debeziumConfiguration.asProperties())
                .notifying(this::handleEvent)
                .build();

        executorService.submit(engine);
        log.info("Debezium CDC engine started — watching public.products");
    }

    @PreDestroy
    public void stop() throws IOException {
        if (engine != null) {
            log.info("Stopping Debezium CDC engine");
            engine.close();
        }
        executorService.shutdownNow();
    }

    private void handleEvent(RecordChangeEvent<SourceRecord> changeEvent) {
        SourceRecord record = changeEvent.record();

        // Filter out heartbeat and schema-change records that have no value Struct
        if (!(record.value() instanceof Struct valueStruct)) {
            return;
        }

        // Guard: some records (transaction markers, heartbeats) have a Struct value
        // but no "op" field in their schema — skip those.
        if (valueStruct.schema().field("op") == null) {
            return;
        }
        String op = valueStruct.getString("op");
        if (op == null) {
            return;
        }

        CdcEvent event = new CdcEvent();
        event.setOperation(mapOperation(op));
        event.setTableName(extractTableName(record));
        event.setTimestamp(System.currentTimeMillis());
        event.setLsn(extractLsn(valueStruct));
        event.setTxId(extractTxId(valueStruct));
        event.setBefore(structToMap(valueStruct, "before"));
        event.setAfter(structToMap(valueStruct, "after"));

        log.info("CDC event: {} on {} | lsn={}", event.getOperation(), event.getTableName(), event.getLsn());

        // Broadcast to all WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/cdc-events", event);
    }

    private String mapOperation(String op) {
        return switch (op) {
            case "c" -> "INSERT";
            case "u" -> "UPDATE";
            case "d" -> "DELETE";
            case "r" -> "SNAPSHOT";
            default  -> op.toUpperCase();
        };
    }

    private String extractTableName(SourceRecord record) {
        String topic = record.topic();
        // topic format: <prefix>.<schema>.<table>  e.g. cdc_demo.public.products
        if (topic != null && topic.contains(".")) {
            String[] parts = topic.split("\\.");
            return parts[parts.length - 1];
        }
        return topic;
    }

    private String extractLsn(Struct valueStruct) {
        try {
            Struct source = valueStruct.getStruct("source");
            if (source != null) {
                Object lsn = source.get("lsn");
                return lsn != null ? lsn.toString() : null;
            }
        } catch (Exception ignored) {}
        return null;
    }

    private Long extractTxId(Struct valueStruct) {
        try {
            Struct source = valueStruct.getStruct("source");
            if (source != null) {
                Object txId = source.get("txId");
                if (txId instanceof Number n) return n.longValue();
            }
        } catch (Exception ignored) {}
        return null;
    }

    private Map<String, Object> structToMap(Struct parent, String fieldName) {
        Struct nested;
        try {
            nested = parent.getStruct(fieldName);
        } catch (Exception e) {
            return null;
        }
        if (nested == null) return null;

        List<Field> fields = nested.schema().fields();
        Map<String, Object> map = new HashMap<>();
        for (Field field : fields) {
            Object value = nested.get(field);
            // Convert org.apache.kafka.connect types to plain Java types
            if (value instanceof Struct) {
                // Nested structs (rare for simple tables) — convert to string
                map.put(field.name(), value.toString());
            } else {
                map.put(field.name(), value);
            }
        }
        return map;
    }
}
