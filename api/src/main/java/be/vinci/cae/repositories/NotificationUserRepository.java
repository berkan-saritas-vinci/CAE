package be.vinci.cae.repositories;

import be.vinci.cae.models.NotificationUser;
import be.vinci.cae.models.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for notification-user relation persistence operations.
 */
@Repository
public interface NotificationUserRepository extends CrudRepository<NotificationUser, Long> {

  /**
   * Finds all notification-user relations for a given user.
   *
   * @param user related user
   * @return all matching notification-user relations
   */
  Iterable<NotificationUser> findAllByUser(User user);

  /**
   * Finds a notification-user relation by its identifier.
   *
   * @param id relation identifier
   * @return matching relation, or {@code null} when not found
   */
  NotificationUser findNotificationUserById(Long id);

}