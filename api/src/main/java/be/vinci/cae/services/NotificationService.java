package be.vinci.cae.services;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.NotificationDto;
import be.vinci.cae.models.NotificationUser;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.NotificationRepository;
import be.vinci.cae.repositories.NotificationUserRepository;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Business service for notification lifecycle and user-notification state.
 */
@Service
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final NotificationUserRepository notificationuserrepository;
  private final UserService userService;

  /**
   * Creates the service with its repositories.
   *
   * @param notificationRepository repository for notifications
   * @param notificationuserrepository repository for notification-user relations
   */
  public NotificationService(NotificationRepository notificationRepository,
      NotificationUserRepository notificationuserrepository, UserService userService) {
    this.notificationRepository = notificationRepository;
    this.notificationuserrepository = notificationuserrepository;
    this.userService = userService;
  }

  /**
   * Returns all notifications for a specific user.
   *
   * @param user user
   * @return iterable of notification DTOs ordered by date descending
   */
  public Iterable<NotificationDto> readAllNotificationsByUser(User user) {

    Iterable<NotificationUser> notifications =
        notificationuserrepository.findAllByUser(user);

    List<NotificationDto> notifs = new ArrayList<>();
    for (NotificationUser n : notifications) {
      notifs.add(new NotificationDto(
          n.getId(),
          n.getNotification().getMessage(),
          n.getNotification().getDate(),
          n.isLu()
      ));
    }
    notifs.sort((n1, n2) -> n2.getDate().compareTo(n1.getDate()));
    return notifs;
  }

  /**
   * Retrieves a notification by its identifier.
   *
   * @param id notification identifier
   * @return matching notification, or {@code null} if not found
   */
  public Notification readNotificationsById(Long id) {
    return notificationRepository.findNotificationById(id);
  }

  /**
   * Marks the given notification as read for the linked relation.
   *
   * @param notification notification whose relation state must be updated
   * @return updated notification-user relation
   */
  public NotificationUser updateStatutNotification(Notification notification) {
    NotificationUser nu = notificationuserrepository.findById(notification.getId())
        .orElseThrow();
    nu.setLu(true);
    return notificationuserrepository.save(nu);
  }

  /**
   * Create a notification.
   *
   * @param newNotification the new notification
   * @return the notification
   */
  public Notification createNotification(NewNotification newNotification) {
    Notification notification = new Notification();
    notification.setMessage(newNotification.getMessage());
    Date now = new Date(System.currentTimeMillis());
    notification.setDate(now);
    return notificationRepository.save(notification);
  }

}
