package com.example.tsh.web.Util;

import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

public class CutoffUtil {

    public static String getCutoffLabel(LocalDate date) {
        int day = date.getDayOfMonth();
        int year = date.getYear();
        Month month = date.getMonth();

        if (day >= 26) {
            LocalDate start = LocalDate.of(year, month, 26);
            LocalDate end = LocalDate.of(year, month, YearMonth.of(year, month).lengthOfMonth());
            return formatLabel(start, end);
        } else if (day >= 12) {
            LocalDate start = LocalDate.of(year, month, 12);
            LocalDate end = LocalDate.of(year, month, 26);
            return formatLabel(start, end);
        } else {
            Month prevMonth = month.minus(1);
            int lastDayPrevMonth = YearMonth.of(year, prevMonth).lengthOfMonth();
            LocalDate start = LocalDate.of(year, prevMonth, 26);
            LocalDate end = LocalDate.of(year, month, 11);
            return formatLabel(start, end);
        }
    }

    private static String formatLabel(LocalDate start, LocalDate end) {
        return start.format(DateTimeFormatter.ofPattern("MMM d")) + " - " +
                end.format(DateTimeFormatter.ofPattern("MMM d"));
    }
}


