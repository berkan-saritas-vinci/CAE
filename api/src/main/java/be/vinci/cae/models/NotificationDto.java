package be.vinci.cae.models;

import java.util.Date;

/**
 * Data transfer object exposing notification data for API responses.
 */
public class NotificationDto {
  private Long id;
  private String message;
  private Date date;
  private boolean lu;

  /**
   * Creates a notification DTO.
   *
   * @param id notification-user identifier
   * @param message notification content
   * @param date notification creation date
   * @param lu read status
   */
  public NotificationDto(Long id, String message, Date date, boolean lu) {
    this.id = id;
    this.message = message;
    this.date = date;
    this.lu = lu;
  }

  /**
   * Gets the notification date.
   *
   * @return notification date
   */
  public Date getDate() {
    return date;
  }

  /**
   * Sets the notification date.
   *
   * @param date notification date
   */
  public void setDate(Date date) {
    this.date = date;
  }

  /**
   * Gets the notification message.
   *
   * @return notification message
   */
  public String getMessage() {
    return message;
  }

  /**
   * Sets the notification message.
   *
   * @param message notification message
   */
  public void setMessage(String message) {
    this.message = message;
  }

  /**
   * Returns whether the notification was read.
   *
   * @return true when read, false otherwise
   */
  public boolean isLu() {
    return lu;
  }

  /**
   * Sets the read status.
   *
   * @param lu read status
   */
  public void setLu(boolean lu) {
    this.lu = lu;
  }

  /**
   * Gets the notification-user identifier.
   *
   * @return identifier
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the notification-user identifier.
   *
   * @param id identifier
   */
  public void setId(Long id) {
    this.id = id;
  }
}
