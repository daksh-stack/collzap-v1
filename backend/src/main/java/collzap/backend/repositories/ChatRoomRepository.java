package collzap.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import collzap.backend.models.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    Optional<ChatRoom> findByMatchGroupId(UUID matchGroupId);

    @Query("""
        select r from ChatRoom r
        join fetch r.matchGroup g
        join fetch g.interest
        where r.matchGroup.id in :groupIds
        """)
    List<ChatRoom> findWithGroupByMatchGroupIdIn(@Param("groupIds") List<UUID> groupIds);

    @Query("""
        select r from ChatRoom r
        join fetch r.matchGroup g
        join fetch g.interest
        join fetch g.college
        where r.id = :id
        """)
    Optional<ChatRoom> findWithGroupById(@Param("id") UUID id);
}
