package com.example.tsh.web.Service;

import com.example.tsh.web.Entity.Payroll;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class PayrollCutoffService {

    // Method to determine the current cutoff period based on today's date
    public CutoffPeriod getCurrentCutoffPeriod() {
        LocalDate today = LocalDate.now();
        return getCutoffPeriodForDate(today);
    }

    // Method to get cutoff period for a specific date
    public CutoffPeriod getCutoffPeriodForDate(LocalDate date) {
        int dayOfMonth = date.getDayOfMonth();
        int year = date.getYear();
        int month = date.getMonthValue();

        if (dayOfMonth <= 10) {
            // First cutoff period of the month (26th previous month to 10th current month)
            LocalDate previousMonth = date.minusMonths(1);
            YearMonth previousYearMonth = YearMonth.of(previousMonth.getYear(), previousMonth.getMonth());
            LocalDate startDate = previousYearMonth.atDay(26);
            LocalDate endDate = YearMonth.of(year, month).atDay(10);
            LocalDate payDate = YearMonth.of(year, month).atDay(15);

            return new CutoffPeriod(startDate, endDate, payDate, "First Cutoff");
        } else if (dayOfMonth <= 25) {
            // Second cutoff period (11th to 25th)
            LocalDate startDate = YearMonth.of(year, month).atDay(11);
            LocalDate endDate = YearMonth.of(year, month).atDay(25);
            LocalDate payDate = YearMonth.of(year, month).atEndOfMonth();

            // Adjust for months with only 30 days
            if (payDate.getDayOfMonth() == 31) {
                payDate = payDate.withDayOfMonth(30);
            }

            return new CutoffPeriod(startDate, endDate, payDate, "Second Cutoff");
        } else {
            // First cutoff period of next month (26th current month to 10th next month)
            LocalDate nextMonth = date.plusMonths(1);
            YearMonth nextYearMonth = YearMonth.of(nextMonth.getYear(), nextMonth.getMonth());
            LocalDate startDate = YearMonth.of(year, month).atDay(26);
            LocalDate endDate = nextYearMonth.atDay(10);
            LocalDate payDate = nextYearMonth.atDay(15);

            return new CutoffPeriod(startDate, endDate, payDate, "First Cutoff");
        }
    }

    // Method to get all cutoff periods for a given month
    public List<CutoffPeriod> getCutoffPeriodsForMonth(int year, int month) {
        List<CutoffPeriod> periods = new ArrayList<>();

        // First cutoff period (26th previous month to 10th current month)
        LocalDate prevMonth = LocalDate.of(year, month, 1).minusMonths(1);
        YearMonth prevYearMonth = YearMonth.of(prevMonth.getYear(), prevMonth.getMonth());
        LocalDate firstStart = prevYearMonth.atDay(26);
        LocalDate firstEnd = YearMonth.of(year, month).atDay(10);
        LocalDate firstPayDate = YearMonth.of(year, month).atDay(15);
        periods.add(new CutoffPeriod(firstStart, firstEnd, firstPayDate, "First Cutoff"));

        // Second cutoff period (11th to 25th)
        LocalDate secondStart = YearMonth.of(year, month).atDay(11);
        LocalDate secondEnd = YearMonth.of(year, month).atDay(25);
        LocalDate secondPayDate = YearMonth.of(year, month).atEndOfMonth();

        // Adjust for months with only 30 days
        if (secondPayDate.getDayOfMonth() == 31) {
            secondPayDate = secondPayDate.withDayOfMonth(30);
        }

        periods.add(new CutoffPeriod(secondStart, secondEnd, secondPayDate, "Second Cutoff"));

        return periods;
    }

    // Helper class to represent a cutoff period
    public static class CutoffPeriod {
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalDate payDate;
        private String description;

        public CutoffPeriod(LocalDate startDate, LocalDate endDate, LocalDate payDate, String description) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.payDate = payDate;
            this.description = description;
        }

        // Getters
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public LocalDate getPayDate() { return payDate; }
        public String getDescription() { return description; }
    }
}