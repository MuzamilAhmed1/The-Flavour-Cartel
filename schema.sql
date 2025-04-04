-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 04, 2025 at 07:50 PM
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
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(2, 'Asian'),
(4, 'British'),
(1, 'Italian'),
(3, 'Vegetarian');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `recipe_id`, `comment`, `created_at`) VALUES
(1, 1, 2, 'Sooo good!', '2025-04-04 19:21:08'),
(2, 1, 1, 'comment', '2025-04-04 19:44:12'),
(3, 1, 1, 'comment2', '2025-04-04 19:45:24'),
(4, 1, 1, 'comment', '2025-04-04 19:47:11'),
(5, 1, 4, 'nice dish!', '2025-04-04 19:50:13');

-- --------------------------------------------------------

--
-- Table structure for table `recipes`
--

CREATE TABLE `recipes` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `ingredients` text,
  `instructions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `recipes`
--

INSERT INTO `recipes` (`id`, `title`, `description`, `image`, `category_id`, `user_id`, `ingredients`, `instructions`, `created_at`) VALUES
(1, 'Chicken Curry', 'A flavorful chicken curry with a rich, spiced coconut sauce.', 'curry.jpg', 2, 1, '500g chicken, cut into pieces\r\n2 tbsp curry powder\r\n400ml coconut milk\r\n1 large onion, chopped\r\n3 garlic cloves, minced\r\n1 inch ginger, grated\r\n2 tbsp vegetable oil\r\nSalt and pepper to taste\r\nFresh coriander for garnish', '1. Marinate the chicken with salt and pepper for 10 minutes.\r\n2. Heat vegetable oil in a pan and sauté the chopped onions until soft.\r\n3. Add garlic and ginger; cook for an additional 2 minutes.\r\n4. Stir in the curry powder and cook for 1 minute.\r\n5. Add the chicken pieces and brown them on all sides.\r\n6. Pour in the coconut milk and bring to a simmer.\r\n7. Simmer for 20 minutes until the chicken is fully cooked.\r\n8. Garnish with fresh coriander and serve with rice.', '2025-03-13 12:23:55'),
(2, 'Spaghetti Bolognese', 'A classic Italian pasta dish with a rich and hearty meat sauce.', 'spaghetti.jpg', 1, 2, '500g minced beef\r\n1 onion, finely chopped\r\n2 garlic cloves, minced\r\n400g canned tomatoes\r\n2 tbsp tomato paste\r\n1 cup beef broth\r\n1 tsp dried oregano\r\n1 tsp dried basil\r\nSalt and pepper to taste\r\nSpaghetti pasta\r\nOlive oil', '1. Heat olive oil in a large pan over medium heat.\r\n2. Add the chopped onion and garlic; sauté until soft.\r\n3. Add the minced beef and cook until browned.\r\n4. Stir in the tomato paste, canned tomatoes, and beef broth.\r\n5. Season with oregano, basil, salt, and pepper.\r\n6. Simmer for 30 minutes, stirring occasionally.\r\n7. Meanwhile, cook the spaghetti according to package instructions.\r\n8. Serve the meat sauce over the spaghetti; garnish with fresh basil if desired.', '2025-03-13 12:23:55'),
(3, 'Vegan Salad', 'A refreshing and nutritious salad featuring a mix of fresh vegetables and a tangy dressing.', 'salad.jpg', 3, 3, '2 cups mixed greens\r\n1 cucumber, sliced\r\n1 tomato, diced\r\n1 avocado, sliced\r\n1/2 red onion, thinly sliced\r\n1 carrot, grated\r\nFor the dressing:\r\nJuice of 1 lemon\r\n2 tbsp olive oil\r\nSalt and pepper to taste', '1. In a large bowl, combine the mixed greens, cucumber, tomato, avocado, red onion, and carrot.\r\n2. In a small bowl, whisk together the lemon juice, olive oil, salt, and pepper to create the dressing.\r\n3. Drizzle the dressing over the salad and toss gently to combine.\r\n4. Serve immediately for a fresh, healthy meal.', '2025-03-13 12:23:56'),
(4, 'fish and chips', 'a nice british dish', 'fish_and_chips.jpg', 4, 1, 'fish\r\npotatoes\r\nsalt\r\nlemon', 'mix together\r\nserve\r\nbash', '2025-04-04 19:49:58');

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
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `recipe_id` (`recipe_id`);

--
-- Indexes for table `recipes`
--
ALTER TABLE `recipes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

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
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `recipes`
--
ALTER TABLE `recipes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recipes`
--
ALTER TABLE `recipes`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
