package com.tripCraft.model;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "budget_tracking")
public class BudgetTracking {
    @Id
    private String id;
    private String userId;
    private String itineraryId;
    private double totalBudget;
    private double spent;
    private List<Expense> expenses;
    private LocalDateTime createdAt = LocalDateTime.now();
}

class Expense {
    private String category;
    private double amount;
    private LocalDate date;
}
