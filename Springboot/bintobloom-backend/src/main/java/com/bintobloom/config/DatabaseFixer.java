package com.bintobloom.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("Attempting to fix database schema...");
            // modify the column to be loose varchar to support new enum values if it was restricted
            // Using a large size to be safe.
            jdbcTemplate.execute("ALTER TABLE pickup_requests MODIFY COLUMN pickup_status VARCHAR(50)");
            System.out.println("Database schema fixed: pickup_status converted/ensured as VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("Schema fix warning (might be already correct or different DB): " + e.getMessage());
        }
    }
}
