package be.vinci.cae.controllers;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.NotificationDto;
import be.vinci.cae.models.User;
import be.vinci.cae.services.NotificationService;
import be.vinci.cae.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller exposing endpoints for notification management.
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

  private final NotificationService notifiationservice;
  private final UserService userService;

  /**
   * Creates the controller with required services.
   *
   * @param notificationService notification business service
   */
  public NotificationController(NotificationService notificationService, UserService userService) {
    this.notifiationservice = notificationService;
    this.userService = userService;
  }

  /**
   * Returns all notifications for a specific user.
   *
   * @param id user identifier
   * @return all notifications mapped to DTOs and ordered by date descending
   */
  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public Iterable<NotificationDto> getNotification(@PathVariable(name = "id") long id) {
    User user = userService.findById(id);
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found");
    }
    return notifiationservice.readAllNotificationsByUser(user);
  }

  /**
   * Creates a notification.
   *
   * @param newNotification the new notification
   * @return the notification.
   */
  @PostMapping({"", "/"})
  @PreAuthorize("hasRole('ADMIN')")
  public Notification addNotification(@RequestBody NewNotification newNotification) {
    if (isInvalidNotification(newNotification)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    return notifiationservice.createNotification(newNotification);
  }

  private boolean isInvalidNotification(NewNotification newNotification) {
    return newNotification == null
        || newNotification.getMessage() == null
        || newNotification.getMessage().isBlank()
        || newNotification.getDate() == null;
  }

}
