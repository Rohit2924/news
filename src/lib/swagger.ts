import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "News Portal API",
      version: "1.0.0",
      description: "API Documentation for your News Portal",
    },
  },
  apis: ["./src/app/api/**/*.ts",
         "./src/app/api/admin/analytics/route.ts"   
  ], // adjust path as needed
};

export const swaggerSpec = swaggerJsdoc(options);
