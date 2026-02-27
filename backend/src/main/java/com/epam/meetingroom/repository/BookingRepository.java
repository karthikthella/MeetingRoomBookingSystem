package com.epam.meetingroom.repository;

import com.epam.meetingroom.domain.enums.BookingStatus;
import com.epam.meetingroom.domain.model.Booking;
import com.epam.meetingroom.domain.model.Room;
import com.epam.meetingroom.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByUserOrderByDateDescStartTimeDesc(User user);
    
    List<Booking> findByStatus(BookingStatus status);
    
    List<Booking> findByRoomAndStatus(Room room, BookingStatus status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
           "WHERE b.room = :room AND b.date = :date AND b.status = 'APPROVED' " +
           "AND (:startTime < b.endTime AND :endTime > b.startTime) " +
           "AND (:id IS NULL OR b.id <> :id)")
    boolean existsOverlappingApprovedBooking(@Param("room") Room room, 
                                             @Param("date") LocalDate date, 
                                             @Param("startTime") LocalTime startTime, 
                                             @Param("endTime") LocalTime endTime,
                                             @Param("id") Long id);
}
