package com.cdcdemo.controller;

import com.cdcdemo.model.AuditLog;
import com.cdcdemo.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuditLogController {

    private final AuditLogRepository repo;

    public AuditLogController(AuditLogRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<AuditLog> list() {
        return repo.findTop100ByOrderByTimestampDesc();
    }

    @GetMapping("/count")
    public long count() {
        return repo.count();
    }
}
