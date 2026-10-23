package be.vinci.cae.controllers;

import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.NotificationUser;
import be.vinci.cae.services.NotificationUserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller exposing endpoints for notification-user relations.
 */
@RestController
@RequestMapping("/notificationsusers")
public class NotificationUserController {

  private final NotificationUserService notifiationUserService;

  /**
   * Creates the controller with its service dependency.
   *
   * @param notificationUserService service handling notification-user operations
   */
  public NotificationUserController(NotificationUserService notificationUserService) {
    this.notifiationUserService = notificationUserService;
  }

  /**
   * Creates a new notification-user relation.
   *
   * @param newNotificationUser payload containing user and notification references
   * @return the persisted relation
   */
  @PostMapping({"", "/"})
  @PreAuthorize("isAuthenticated()")
  public NotificationUser addNotificationUser(
      @RequestBody NewNotificationUser newNotificationUser) {
    if (isInvalidNotificationUser(newNotificationUser)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    return notifiationUserService.createNotificationUser(newNotificationUser);
  }

  private boolean isInvalidNotificationUser(NewNotificationUser newNotificationUser) {
    return newNotificationUser == null;
  }

  /**
   * Marks the notification relation as read.
   *
   * @param id identifier of the notification-user relation to update
   */
  @PatchMapping("/{id}/lu")
  @PreAuthorize("isAuthenticated()")
  public void markAsRead(@PathVariable long id) {
    NotificationUser notification = notifiationUserService.readNotificationUserById(id);
    notifiationUserService.markAsRead(notification);
  }

}
