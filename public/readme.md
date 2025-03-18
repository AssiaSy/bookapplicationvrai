<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Management System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .filter-container {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .filter-item {
            display: flex;
            flex-direction: column;
        }
        .filter-item label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .filter-item input, .filter-item select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 4px;
        }
        button:hover {
            background-color: #45a049;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            cursor: pointer;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        .loading {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #666;
        }
        .error {
            color: red;
            text-align: center;
            padding: 10px;
        }
    </style>
</head>
<body>
    <h1>Book Management System</h1>
    
    <div class="filter-container">
        <div class="filter-item">
            <label for="genre-filter">Genre:</label>
            <select id="genre-filter">
                <option value="">All Genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Science Fiction">Science Fiction</option>
            </select>
        </div>
        <div class="filter-item">
            <label for="author-filter">Author:</label>
            <input type="text" id="author-filter" placeholder="Author name">
        </div>
        <div class="filter-item">
            <label for="year-filter">Published Year:</label>
            <input type="number" id="year-filter" placeholder="Year">
        </div>
        <div class="filter-item" style="justify-content: flex-end;">
            <button id="filter-button">Apply Filters</button>
        </div>
         <div class="add">
            <button id="add-button">Add book</button>
         </div>
    </div>
    
    <div id="books-container">
        <p class="loading">Loading books...</p>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const booksContainer = document.getElementById('books-container');
            const filterButton = document.getElementById('filter-button');
            const genreFilter = document.getElementById('genre-filter');
            const authorFilter = document.getElementById('author-filter');
            const yearFilter = document.getElementById('year-filter');
            
            let currentSort = 'title';
            let currentOrder = 'asc';
            
            // Function to fetch and display books
            function fetchBooks() {
                const genre = genreFilter.value;
                const author = authorFilter.value;
                const year = yearFilter.value;
                
                let url = '/api/books?';
                
                if (genre) url += `genre=${encodeURIComponent(genre)}&`;
                if (author) url += `author=${encodeURIComponent(author)}&`;
                if (year) url += `year=${encodeURIComponent(year)}&`;
                
                url += `sort=${currentSort}&order=${currentOrder}`;
                
                booksContainer.innerHTML = '<p class="loading">Loading books...</p>';
                
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(books => {
                        if (books.length === 0) {
                            booksContainer.innerHTML = '<p>No books found matching your criteria.</p>';
                            return;
                        }
                        
                        let tableHTML = `
                            <table>
                                <thead>
                                    <tr>
                                        <th data-sort="title">Title</th>
                                        <th data-sort="author">Author</th>
                                        <th data-sort="published_year">Year</th>
                                        <th data-sort="genre">Genre</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        
                        books.forEach(book => {
                            tableHTML += `
                                <tr>
                                    <td>${book.title}</td>
                                    <td>${book.author}</td>
                                    <td>${book.published_year || 'N/A'}</td>
                                    <td>${book.genre || 'N/A'}</td>
                                    <td>${book.description || 'No description available'}</td>
                                </tr>
                            `;
                        });
                        
                        tableHTML += `
                                </tbody>
                            </table>
                        `;
                        
                        booksContainer.innerHTML = tableHTML;
                        
                        // Add sorting functionality to table headers
                        document.querySelectorAll('th[data-sort]').forEach(header => {
                            header.addEventListener('click', () => {
                                const sortField = header.getAttribute('data-sort');
                                
                                if (currentSort === sortField) {
                                    currentOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                                } else {
                                    currentSort = sortField;
                                    currentOrder = 'asc';
                                }
                                
                                fetchBooks();
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching books:', error);
                        booksContainer.innerHTML = '<p class="error">Error loading books. Please try again later.</p>';
                    });
            }
            
            // Initial fetch of books
            fetchBooks();
            
            // Add event listener for filter button
            filterButton.addEventListener('click', fetchBooks);
        });
    </script>
</body>
</html>