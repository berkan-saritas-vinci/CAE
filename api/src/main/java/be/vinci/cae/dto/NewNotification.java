package be.vinci.cae.dto;

import java.util.Date;

/**
 * DTO used to create a notification.
 */
public class NewNotification {

  private String message;
  private Date date;

  /**
   * Creates a new notification DTO.
   *
   * @param date    the date of the notification.
   * @param message the notification message.
   */
  public NewNotification(Date date, String message) {
    this.date = date;
    this.message = message;
  }

  public Date getDate() {
    return date;
  }

  public String getMessage() {
    return message;
  }

  public void setDate(Date date) {
    this.date = date;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}
