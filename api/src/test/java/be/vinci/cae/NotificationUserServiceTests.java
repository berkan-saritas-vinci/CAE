package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.NotificationUser;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.NotificationUserRepository;
import be.vinci.cae.services.NotificationUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * Unit tests for NotificationUserService covering all methods and code paths.
 */
public class NotificationUserServiceTests {

  private NotificationUserRepository notificationUserRepository;
  private NotificationUserService notificationUserService;

  @BeforeEach
  void setUp() {
    notificationUserRepository = org.mockito.Mockito.mock(NotificationUserRepository.class);
    notificationUserService = new NotificationUserService(notificationUserRepository);
  }

  @Test
  void createNotificationUser_shouldCopyFieldsAndSetLuFalseAndSave() {
    User user = new User();
    user.setId(5L);

    Notification notification = new Notification();
    notification.setId(10L);

    NewNotificationUser newNotificationUser = new NewNotificationUser(notification, user);

    NotificationUser saved = new NotificationUser();
    saved.setId(1L);
    saved.setNotification(notification);
    saved.setUser(user);
    saved.setLu(false);

    when(notificationUserRepository.save(org.mockito.ArgumentMatchers.any(NotificationUser.class)))
        .thenReturn(saved);

    NotificationUser result = notificationUserService.createNotificationUser(newNotificationUser);

    assertSame(saved, result);

    ArgumentCaptor<NotificationUser> captor = ArgumentCaptor.forClass(NotificationUser.class);
    verify(notificationUserRepository).save(captor.capture());
    NotificationUser created = captor.getValue();

    assertSame(notification, created.getNotification());
    assertSame(user, created.getUser());
    assertEquals(false, created.isLu());
  }

  @Test
  void readNotificationUserById_shouldReturnRepositoryValue() {
    NotificationUser notificationUser = new NotificationUser();
    notificationUser.setId(8L);

    when(notificationUserRepository.findNotificationUserById(8L))
        .thenReturn(notificationUser);

    NotificationUser result = notificationUserService.readNotificationUserById(8L);

    assertSame(notificationUser, result);
    verify(notificationUserRepository).findNotificationUserById(8L);
  }

  @Test
  void markAsRead_shouldSetLuTrueAndSave() {
    NotificationUser notificationUser = new NotificationUser();
    notificationUser.setId(12L);
    notificationUser.setLu(false);

    when(notificationUserRepository.save(notificationUser)).thenReturn(notificationUser);

    notificationUserService.markAsRead(notificationUser);

    assertEquals(true, notificationUser.isLu());
    verify(notificationUserRepository).save(notificationUser);
  }

  @Test
  void markAsRead_shouldUpdateExistingReadNotification() {
    NotificationUser notificationUser = new NotificationUser();
    notificationUser.setId(15L);
    notificationUser.setLu(true);

    when(notificationUserRepository.save(notificationUser)).thenReturn(notificationUser);

    notificationUserService.markAsRead(notificationUser);

    assertEquals(true, notificationUser.isLu());
    verify(notificationUserRepository).save(notificationUser);
  }
}
