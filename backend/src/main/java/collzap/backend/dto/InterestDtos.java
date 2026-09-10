package collzap.backend.dto;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import collzap.backend.enums.ConnectionType;
import collzap.backend.enums.InterestCategory;
import collzap.backend.enums.ProjectType;
import collzap.backend.enums.SeriousnessLevel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class InterestDtos {

    private InterestDtos() {
    }

    public record InterestResponse(UUID id, String name, InterestCategory category, int displayOrder) {
    }

    public record CreateInterestRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name,

        @NotNull(message = "Category is required")
        InterestCategory category
    ) {
    }

    public record UpdateInterestRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name
    ) {
    }

    /** Both grids in one call, along with the selection caps the UI counter shows. */
    public record InterestCatalogResponse(
        List<InterestResponse> longTerm,
        List<InterestResponse> shortTerm,
        int maxLongTermSelections,
        int maxShortTermSelections
    ) {
    }

    public record SelectProjectTypesRequest(
        @NotEmpty(message = "Pick at least one of Long-Term Peer or Short-Term Buddy")
        Set<ProjectType> projectTypes
    ) {
    }

    public record ProjectTypesResponse(Set<ProjectType> projectTypes) {
    }

    public record SelectInterestsRequest(
        @NotNull(message = "Project type is required")
        ProjectType projectType,

        @NotEmpty(message = "Pick at least one interest")
        @Valid
        List<InterestSelectionItem> selections
    ) {
    }

    public record InterestSelectionItem(
        @NotNull(message = "Interest is required")
        UUID interestId,

        @Size(max = 30, message = "Sub-tag must be at most 30 characters")
        String subTag
    ) {
    }

    public record UserInterestResponse(
        UUID interestId,
        String interestName,
        InterestCategory category,
        ProjectType projectType,
        String subTag,
        SeriousnessLevel level,
        Integer score
    ) {
    }

    public record SelectConnectionTypeRequest(
        @NotNull(message = "Project type is required")
        ProjectType projectType,

        @NotNull(message = "Connection type is required")
        ConnectionType connectionType
    ) {
    }

    public record InterestFeedbackRequest(
        @NotNull(message = "Project type is required")
        ProjectType projectType,

        @NotBlank(message = "Tell us which interest you were looking for")
        @Size(max = 200)
        String suggestion
    ) {
    }
}
