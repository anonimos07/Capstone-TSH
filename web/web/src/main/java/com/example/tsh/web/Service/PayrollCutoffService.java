//package com.example.tsh.web.Service;
//
//import com.example.tsh.web.Entity.Payroll;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.time.YearMonth;
//import java.time.temporal.TemporalAdjusters;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//public class PayrollCutoffService {
//
//    public CutoffPeriod getCurrentCutoffPeriod() {
//        LocalDate today = LocalDate.now();
//        return getCutoffPeriodForDate(today);
//    }
//
//    public CutoffPeriod getCutoffPeriodForDate(LocalDate date) {
//        int dayOfMonth = date.getDayOfMonth();
//        int year = date.getYear();
//        int month = date.getMonthValue();
//
//        if (dayOfMonth <= 10) {
//            LocalDate previousMonth = date.minusMonths(1);
//            YearMonth previousYearMonth = YearMonth.of(previousMonth.getYear(), previousMonth.getMonth());
//            LocalDate startDate = previousYearMonth.atDay(26);
//            LocalDate endDate = YearMonth.of(year, month).atDay(10);
//            LocalDate payDate = YearMonth.of(year, month).atDay(15);
//
//            return new CutoffPeriod(startDate, endDate, payDate, "First Cutoff");
//        } else if (dayOfMonth <= 25) {
//
//            LocalDate startDate = YearMonth.of(year, month).atDay(11);
//            LocalDate endDate = YearMonth.of(year, month).atDay(25);
//            LocalDate payDate = YearMonth.of(year, month).atEndOfMonth();
//
//            if (payDate.getDayOfMonth() == 31) {
//                payDate = payDate.withDayOfMonth(30);
//            }
//
//            return new CutoffPeriod(startDate, endDate, payDate, "Second Cutoff");
//        } else {
//
//            LocalDate nextMonth = date.plusMonths(1);
//            YearMonth nextYearMonth = YearMonth.of(nextMonth.getYear(), nextMonth.getMonth());
//            LocalDate startDate = YearMonth.of(year, month).atDay(26);
//            LocalDate endDate = nextYearMonth.atDay(10);
//            LocalDate payDate = nextYearMonth.atDay(15);
//
//            return new CutoffPeriod(startDate, endDate, payDate, "First Cutoff");
//        }
//    }
//
//    public List<CutoffPeriod> getCutoffPeriodsForMonth(int year, int month) {
//        List<CutoffPeriod> periods = new ArrayList<>();
//
//        LocalDate prevMonth = LocalDate.of(year, month, 1).minusMonths(1);
//        YearMonth prevYearMonth = YearMonth.of(prevMonth.getYear(), prevMonth.getMonth());
//        LocalDate firstStart = prevYearMonth.atDay(26);
//        LocalDate firstEnd = YearMonth.of(year, month).atDay(10);
//        LocalDate firstPayDate = YearMonth.of(year, month).atDay(15);
//        periods.add(new CutoffPeriod(firstStart, firstEnd, firstPayDate, "First Cutoff"));
//
//        LocalDate secondStart = YearMonth.of(year, month).atDay(11);
//        LocalDate secondEnd = YearMonth.of(year, month).atDay(25);
//        LocalDate secondPayDate = YearMonth.of(year, month).atEndOfMonth();
//
//        if (secondPayDate.getDayOfMonth() == 31) {
//            secondPayDate = secondPayDate.withDayOfMonth(30);
//        }
//
//        periods.add(new CutoffPeriod(secondStart, secondEnd, secondPayDate, "Second Cutoff"));
//
//        return periods;
//    }
//
//    public static class CutoffPeriod {
//        private LocalDate startDate;
//        private LocalDate endDate;
//        private LocalDate payDate;
//        private String description;
//
//        public CutoffPeriod(LocalDate startDate, LocalDate endDate, LocalDate payDate, String description) {
//            this.startDate = startDate;
//            this.endDate = endDate;
//            this.payDate = payDate;
//            this.description = description;
//        }
//
//        public LocalDate getStartDate() { return startDate; }
//        public LocalDate getEndDate() { return endDate; }
//        public LocalDate getPayDate() { return payDate; }
//        public String getDescription() { return description; }
//    }
//}