package com.cabbooking.bookingservice.dto;

public class AcceptRequestDTO {
	private Long bookingId;
    private Long cabId;

    public AcceptRequestDTO() {}
    public AcceptRequestDTO(Long bookingId, Long cabId) {
        this.bookingId = bookingId;
        this.cabId = cabId;
    }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Long getCabId() { return cabId; }
    public void setCabId(Long cabId) { this.cabId = cabId; }
}
