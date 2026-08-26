package collzap.backend.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/** Small shared response shapes. */
public final class CommonDtos {

    private CommonDtos() {
    }

    public record MessageResponse(String message) {
        public static MessageResponse of(String message) {
            return new MessageResponse(message);
        }
    }

    public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
    ) {
        public static <S, T> PageResponse<T> from(Page<S> page, java.util.function.Function<S, T> mapper) {
            return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
            );
        }

        public static <T> PageResponse<T> of(List<T> content) {
            return new PageResponse<>(content, 0, content.size(), content.size(), 1, true);
        }
    }
}
