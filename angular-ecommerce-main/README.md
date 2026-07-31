# Amazon Frontend

A modern e-commerce frontend application built with Angular 19, inspired by Amazon's user interface. This project provides a comprehensive shopping experience with product browsing, cart management, and checkout functionality.

## 🚀 Features

- **Product Catalog**: Browse through a variety of products with detailed information
- **Shopping Cart**: Add products to your cart and manage quantities
- **User Authentication**: Login and registration functionality (simulated)
- **Checkout Process**: Complete purchase flow with address and payment information
- **Responsive Design**: Optimized for desktop and mobile devices using Tailwind CSS
- **Payment Success Page**: Confirmation page after successful checkout

## 🛠️ Technology Stack

- **Framework**: Angular 19.x
- **Styling**: Tailwind CSS 4.x with Flowbite components
- **State Management**: Angular's built-in services
- **Routing**: Angular Router
- **Mock Data**: Simulated product and user data

## 📋 Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Angular CLI (v19.x)

## 🔧 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/enzocandido/angular-ecommerce.git
   cd amazon-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:4900
   ```

## 📁 Project Structure

```
src/
├── app/
│   ├── cart/            # Shopping cart functionality
│   ├── checkout/        # Checkout process components
│   ├── core/            # Core services and guards
│   ├── home/            # Homepage components
│   ├── mock/            # Mock data for development
│   ├── payment/         # Payment processing and confirmation
│   ├── product/         # Product details components
│   └── shared/          # Shared components and utilities
├── environments/        # Environment configuration
```

## ⚙️ Available Scripts

- **npm start**: Start the development server
- **npm run build**: Build the project for production
- **npm test**: Run unit tests
- **npm run watch**: Build and watch for changes in development mode

## 📦 Deployment

Build the application for production:

```bash
npm run build
```

This will generate optimized static files in the `dist/` directory that can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspired by Amazon's user interface
- Icons provided by [Flowbite](https://flowbite.com/)
- Product images and descriptions are used for demonstration purposes only
