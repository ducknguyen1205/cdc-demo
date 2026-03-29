package com.cdcdemo.config;

import io.debezium.config.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@org.springframework.context.annotation.Configuration
public class DebeziumConfig {

    @Value("${debezium.db.host}")
    private String dbHost;

    @Value("${debezium.db.port}")
    private String dbPort;

    @Value("${debezium.db.name}")
    private String dbName;

    @Value("${debezium.db.user}")
    private String dbUser;

    @Value("${debezium.db.password}")
    private String dbPassword;

    @Bean
    public Configuration debeziumConfiguration() {
        return Configuration.create()
                // Connector class
                .with("connector.class", "io.debezium.connector.postgresql.PostgresConnector")

                // Connection
                .with("database.hostname", dbHost)
                .with("database.port", dbPort)
                .with("database.dbname", dbName)
                .with("database.user", dbUser)
                .with("database.password", dbPassword)
                .with("database.server.name", "cdc_demo_server")

                // Use pgoutput — native to PostgreSQL 10+, no extra extension needed
                .with("plugin.name", "pgoutput")

                // Replication slot: create fresh on each startup, drop on shutdown
                .with("slot.name", "cdc_demo_slot")
                .with("slot.drop.on.stop", "true")

                // Publication: let Debezium create it automatically
                .with("publication.autocreate.mode", "all_tables")
                .with("publication.name", "cdc_demo_publication")

                // Only watch the products table
                .with("table.include.list", "public.products")

                // Capture the initial snapshot, then stream ongoing changes
                .with("snapshot.mode", "initial")

                // In-memory offset store — no leftover offset files between restarts
                .with("offset.storage",
                      "org.apache.kafka.connect.storage.MemoryOffsetBackingStore")
                .with("offset.flush.interval.ms", "1000")

                // Unique name for this connector instance
                .with("name", "cdc-demo-postgres-connector")

                // Keep the replication slot active with periodic heartbeats
                .with("heartbeat.interval.ms", "10000")

                // Topic prefix (required by Debezium 2.x even in embedded mode)
                .with("topic.prefix", "cdc_demo")

                .build();
    }

    @Bean
    public ExecutorService debeziumExecutorService() {
        return Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "debezium-engine-thread");
            t.setDaemon(true);
            return t;
        });
    }
}
