package be.vinci.cae.dto;

import be.vinci.cae.models.Notification;
import be.vinci.cae.models.User;

/**
 * DTO used to create a notification-user relation.
 */
public class NewNotificationUser {

  private User user;
  private Notification notification;

  /**
   * Creates a new notification-user DTO.
   *
   * @param notification the notification.
   * @param user         the user receiving the notification.
   */
  public NewNotificationUser(Notification notification, User user) {
    this.notification = notification;
    this.user = user;
  }

  public Notification getNotification() {
    return notification;
  }

  public User getUser() {
    return user;
  }

  public void setNotification(Notification notification) {
    this.notification = notification;
  }

  public void setUser(User user) {
    this.user = user;
  }
}
