package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.NotificationDto;
import be.vinci.cae.models.NotificationUser;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.NotificationRepository;
import be.vinci.cae.repositories.NotificationUserRepository;
import be.vinci.cae.services.NotificationService;
import be.vinci.cae.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

public class NotificationsTests {

	private NotificationRepository notificationRepository;
	private NotificationUserRepository notificationUserRepository;
	private UserService userService;

	private NotificationService notificationService;

	@BeforeEach
	void setUp() {
		notificationRepository = org.mockito.Mockito.mock(NotificationRepository.class);
		notificationUserRepository = org.mockito.Mockito.mock(NotificationUserRepository.class);
		userService = org.mockito.Mockito.mock(UserService.class);

		notificationService = new NotificationService(
				notificationRepository,
				notificationUserRepository,
				userService
		);
	}

	@Test
	void readAllNotificationsByUser_shouldMapAndSortByDateDesc() {
		User user = new User();
		user.setId(7L);

		Notification oldNotif = new Notification();
		oldNotif.setMessage("old");
		oldNotif.setDate(new Date(1_000L));

		Notification newNotif = new Notification();
		newNotif.setMessage("new");
		newNotif.setDate(new Date(2_000L));

		NotificationUser relation1 = new NotificationUser();
		relation1.setId(1L);
		relation1.setNotification(oldNotif);
		relation1.setLu(false);

		NotificationUser relation2 = new NotificationUser();
		relation2.setId(2L);
		relation2.setNotification(newNotif);
		relation2.setLu(true);

		when(notificationUserRepository.findAllByUser(user)).thenReturn(Arrays.asList(relation1, relation2));

		Iterable<NotificationDto> result = notificationService.readAllNotificationsByUser(user);

		List<NotificationDto> dtos = new ArrayList<>();
		result.forEach(dtos::add);

		assertEquals(2, dtos.size());
		assertEquals(2L, dtos.get(0).getId());
		assertEquals("new", dtos.get(0).getMessage());
		assertEquals(new Date(2_000L), dtos.get(0).getDate());
		assertEquals(1L, dtos.get(1).getId());
		assertEquals("old", dtos.get(1).getMessage());
		assertEquals(new Date(1_000L), dtos.get(1).getDate());
	}

	@Test
	void readNotificationsById_shouldReturnRepositoryValue() {
		Notification notification = new Notification();
		notification.setId(9L);
		when(notificationRepository.findNotificationById(9L)).thenReturn(notification);

		Notification result = notificationService.readNotificationsById(9L);

		assertSame(notification, result);
	}

	@Test
	void updateStatutNotification_shouldMarkAsReadAndSave() {
		Notification notification = new Notification();
		notification.setId(4L);

		NotificationUser relation = new NotificationUser();
		relation.setId(4L);
		relation.setLu(false);

		when(notificationUserRepository.findById(4L)).thenReturn(Optional.of(relation));
		when(notificationUserRepository.save(relation)).thenReturn(relation);

		NotificationUser result = notificationService.updateStatutNotification(notification);

		assertSame(relation, result);
		assertEquals(true, relation.isLu());
		verify(notificationUserRepository).save(relation);
	}

	@Test
	void updateStatutNotification_shouldThrow_whenRelationDoesNotExist() {
		Notification notification = new Notification();
		notification.setId(404L);
		when(notificationUserRepository.findById(404L)).thenReturn(Optional.empty());

		assertThrows(java.util.NoSuchElementException.class,
				() -> notificationService.updateStatutNotification(notification));
	}

	@Test
	void createNotification_shouldCopyMessageSetDateAndSave() {
		NewNotification newNotification = new NewNotification(new Date(0L), "hello world");

		Notification saved = new Notification();
		saved.setId(99L);
		saved.setMessage("hello world");
		saved.setDate(new Date());

		when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

		Notification result = notificationService.createNotification(newNotification);

		assertSame(saved, result);

		ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
		verify(notificationRepository).save(captor.capture());
		Notification created = captor.getValue();

		assertEquals("hello world", created.getMessage());
		assertNotNull(created.getDate());
	}
}
