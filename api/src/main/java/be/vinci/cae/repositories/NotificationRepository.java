package be.vinci.cae.repositories;

import be.vinci.cae.models.Notification;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for notification persistence operations.
 */
@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Finds a notification by its identifier.
   *
   * @param idNotification notification identifier
   * @return matching notification, or {@code null} when not found
   */
  Notification findNotificationById(Long idNotification);
} 