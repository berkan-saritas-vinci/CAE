package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.cae.models.Picture;
import be.vinci.cae.repositories.PictureRepository;
import be.vinci.cae.services.PictureService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class PictureServiceTests {

  private PictureRepository pictureRepository;
  private PictureService pictureService;

  @BeforeEach
  void setUp() {
    pictureRepository = org.mockito.Mockito.mock(PictureRepository.class);
    pictureService = new PictureService(pictureRepository);
  }

  @Test
  void findByLink_shouldReturnRepositoryValue() {
    Picture picture = new Picture();
    picture.setId(1L);
    picture.setLink("https://example.com/a.png");

    when(pictureRepository.findByLink("https://example.com/a.png")).thenReturn(picture);

    Picture result = pictureService.findByLink("https://example.com/a.png");

    assertSame(picture, result);
    verify(pictureRepository).findByLink("https://example.com/a.png");
  }

  @Test
  void getAll_shouldReturnRepositoryValue() {
    Picture p1 = new Picture();
    p1.setId(1L);
    p1.setLink("https://example.com/a.png");

    Picture p2 = new Picture();
    p2.setId(2L);
    p2.setLink("https://example.com/b.png");

    when(pictureRepository.findAll()).thenReturn(List.of(p1, p2));

    List<Picture> result = pictureService.getAll();

    assertEquals(2, result.size());
    assertSame(p1, result.get(0));
    assertSame(p2, result.get(1));
    verify(pictureRepository).findAll();
  }
}
