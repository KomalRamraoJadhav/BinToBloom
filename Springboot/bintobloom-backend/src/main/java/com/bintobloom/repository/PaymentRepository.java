package com.bintobloom.repository;

import com.bintobloom.entity.Payment;
import com.bintobloom.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
    Payment findByRazorpayOrderId(String razorpayOrderId);
    Payment findByPickupRequest(com.bintobloom.entity.PickupRequest pickupRequest);
}