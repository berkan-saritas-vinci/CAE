package be.vinci.cae;

import be.vinci.cae.models.Indisponibility;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.IndisponibilityRepository;
import be.vinci.cae.services.IndisponibilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IndisponibilityTests {

  private IndisponibilityRepository repository;
  private IndisponibilityService service;

  @BeforeEach
  void setup() {
    repository = mock(IndisponibilityRepository.class);
    service = new IndisponibilityService(repository);
  }

  @Test
  void getByUser_returnsList() {
    when(repository.findByUserId(1L)).thenReturn(List.of(new Indisponibility()));

    List<Indisponibility> result = service.getByUser(1L);

    assertEquals(1, result.size());
    verify(repository).findByUserId(1L);
  }

  @Test
  void getById_returnsIndisponibility() {
    Indisponibility i = new Indisponibility();
    i.setId(10L);

    when(repository.findById(10L)).thenReturn(Optional.of(i));

    Indisponibility result = service.getById(10L);

    assertNotNull(result);
    assertEquals(10L, result.getId());
  }

  @Test
  void getById_throwsWhenNotFound() {
    when(repository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(IllegalArgumentException.class,
      () -> service.getById(99L));
  }


  @Test
  void create_throwsWhenDatesNull() {
    User user = new User();
    user.setId(1L);

    assertThrows(IllegalArgumentException.class,
      () -> service.create(null, LocalDate.now(), user));

    assertThrows(IllegalArgumentException.class,
      () -> service.create(LocalDate.now(), null, user));
  }

  @Test
  void create_throwsWhenStartAfterEnd() {
    User user = new User();
    user.setId(1L);

    LocalDate start = LocalDate.of(2024, 5, 10);
    LocalDate end = LocalDate.of(2024, 5, 1);

    assertThrows(IllegalArgumentException.class,
      () -> service.create(start, end, user));
  }

  @Test
  void create_throwsWhenOverlap() {
    User user = new User();
    user.setId(1L);

    LocalDate start = LocalDate.of(2024, 5, 1);
    LocalDate end = LocalDate.of(2024, 5, 10);

    when(repository.existsByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
      1L, end, start
    )).thenReturn(true);

    assertThrows(IllegalArgumentException.class,
      () -> service.create(start, end, user));
  }

  @Test
  void create_savesWhenValid() {
    User user = new User();
    user.setId(1L);

    LocalDate start = LocalDate.of(2024, 5, 1);
    LocalDate end = LocalDate.of(2024, 5, 10);

    when(repository.existsByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
      1L, end, start
    )).thenReturn(false);

    when(repository.save(any())).thenAnswer(invocation -> {
      Indisponibility input = invocation.getArgument(0);

      Indisponibility saved = new Indisponibility();
      saved.setId(99L);
      saved.setStartDate(input.getStartDate());
      saved.setEndDate(input.getEndDate());
      saved.setUser(input.getUser());

      return saved;
    });

    Indisponibility result = service.create(start, end, user);

    assertEquals(99L, result.getId());
    assertEquals(start, result.getStartDate());
    assertEquals(end, result.getEndDate());
    assertEquals(user, result.getUser());
  }

  @Test
  void delete_callsRepository() {
    service.delete(5L);
    verify(repository).deleteById(5L);
  }
}
