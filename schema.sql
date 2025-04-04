-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 04, 2025 at 07:47 PM
-- Server version: 9.2.0
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `flavour_cartel`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT 'default.png',
  `bio` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `profile_picture`, `bio`, `created_at`) VALUES
(1, 'John Doe', 'john@example.com', '$2b$10$1c7eiY.76x665RmAiYYf.uW8xMjUQfW86QygoAUsrRsyOVFOtwOmO', 'john.jpg', 'Lebrooooon James!', '2025-03-12 13:05:33'),
(2, 'Jane Smith', 'jane@gmail.com', 'password', 'jane.jpg', 'Welcome to my page!', '2025-03-13 14:32:19'),
(3, 'James Johnson', 'james@gmail.com', 'password', 'james.jpg', 'I love food!', '2025-03-13 14:32:19'),
(4, 'Mariano Regalado', 'marianoregalado030704@gmail.com', '$2b$10$1WiOMpKjbz1OU.K7nAlgdu4Wo/J9SqgBI0L3hbRy8/P9pVJ1cIQpC', 'default.png', NULL, '2025-04-04 15:58:57'),
(5, 'HESHAM A', 'hesham@example.com', '$2b$10$1c7eiY.76x665RmAiYYf.uW8xMjUQfW86QygoAUsrRsyOVFOtwOmO', 'default.png', NULL, '2025-04-04 19:46:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
