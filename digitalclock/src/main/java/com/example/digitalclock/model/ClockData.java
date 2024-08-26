package com.example.digitalclock.model;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class ClockData {
    private LocalDateTime dateTime;
    private ZoneId timeZone;

    public ClockData(LocalDateTime dateTime, ZoneId timeZone) {
        this.dateTime = dateTime;
        this.timeZone = timeZone;
    }

    // Getters and setters
    /**
     * @return LocalDateTime return the dateTime
     */
    public LocalDateTime getDateTime() {
        return dateTime;
    }

    /**
     * @param dateTime the dateTime to set
     */
    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    /**
     * @return ZoneId return the timeZone
     */
    public ZoneId getTimeZone() {
        return timeZone;
    }

    /**
     * @param timeZone the timeZone to set
     */
    public void setTimeZone(ZoneId timeZone) {
        this.timeZone = timeZone;
    }

}