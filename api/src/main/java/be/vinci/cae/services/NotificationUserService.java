package be.vinci.cae.services;

import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.NotificationUser;
import be.vinci.cae.repositories.NotificationUserRepository;
import org.springframework.stereotype.Service;

/**
 * Business service for creating and updating user notification links.
 */
@Service
public class NotificationUserService {
  private final NotificationUserRepository notificationUserRepository;

  /**
   * Creates the service with the repository used to persist notification-user
   * relations.
   *
   * @param notificationUserRepository repository for notification-user entities
   */
  public NotificationUserService(NotificationUserRepository notificationUserRepository) {
    this.notificationUserRepository = notificationUserRepository;
  }

  /**
   * Create a notification.
   *
   * @param newNotificationUser the new notification
   * @return the notification
   */
  public NotificationUser createNotificationUser(NewNotificationUser newNotificationUser) {
    NotificationUser notificationUser = new NotificationUser();
    notificationUser.setNotification(newNotificationUser.getNotification());
    notificationUser.setUser(newNotificationUser.getUser());
    notificationUser.setLu(false);
    return notificationUserRepository.save(notificationUser);
  }

  /**
   * Retrieves a notification-user relation by its identifier.
   *
   * @param id relation identifier
   * @return the matching relation, or {@code null} when it does not exist
   */
  public NotificationUser readNotificationUserById(Long id) {
    return notificationUserRepository.findNotificationUserById(id);
  }

  /**
   * Marks a notification-user relation as read and persists the change.
   *
   * @param notificationUser relation to update
   */
  public void markAsRead(NotificationUser notificationUser) {
    notificationUser.setLu(true);
    notificationUserRepository.save(notificationUser);
  }

}
