package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.cae.models.Speciality;
import be.vinci.cae.repositories.SpecialityRepository;
import be.vinci.cae.services.SpecialityService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SpecialityServiceTests {

  private SpecialityRepository specialityRepository;
  private SpecialityService specialityService;

  @BeforeEach
  void setUp() {
    specialityRepository = org.mockito.Mockito.mock(SpecialityRepository.class);
    specialityService = new SpecialityService(specialityRepository);
  }

  @Test
  void findAll_shouldReturnRepositoryValue() {
    Speciality s1 = new Speciality();
    s1.setId(1L);
    s1.setSpeciality("Backend");

    Speciality s2 = new Speciality();
    s2.setId(2L);
    s2.setSpeciality("Frontend");

    when(specialityRepository.findAll()).thenReturn(List.of(s1, s2));

    List<Speciality> result = specialityService.findAll();

    assertEquals(2, result.size());
    assertSame(s1, result.get(0));
    assertSame(s2, result.get(1));
    verify(specialityRepository).findAll();
  }

  @Test
  void findBySpeciality_shouldReturnRepositoryValue() {
    Speciality speciality = new Speciality();
    speciality.setId(10L);
    speciality.setSpeciality("DevOps");

    when(specialityRepository.findBySpeciality("DevOps")).thenReturn(speciality);

    Speciality result = specialityService.findBySpeciality("DevOps");

    assertSame(speciality, result);
    verify(specialityRepository).findBySpeciality("DevOps");
  }
}
