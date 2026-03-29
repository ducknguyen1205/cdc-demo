package com.cdcdemo.dto;

import java.util.Map;
import java.util.UUID;

public class CdcEvent {

    private String eventId;
    private String operation;   // INSERT, UPDATE, DELETE, SNAPSHOT
    private String tableName;
    private long timestamp;
    private String lsn;
    private Long txId;
    private Map<String, Object> before;
    private Map<String, Object> after;

    public CdcEvent() {
        this.eventId = UUID.randomUUID().toString();
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public String getLsn() { return lsn; }
    public void setLsn(String lsn) { this.lsn = lsn; }

    public Long getTxId() { return txId; }
    public void setTxId(Long txId) { this.txId = txId; }

    public Map<String, Object> getBefore() { return before; }
    public void setBefore(Map<String, Object> before) { this.before = before; }

    public Map<String, Object> getAfter() { return after; }
    public void setAfter(Map<String, Object> after) { this.after = after; }
}
