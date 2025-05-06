const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Web Toons Wala API',
            version: '1.0.0',
            description: 'API documentation for Web Toons Wala application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'http://44.220.159.154:3000',
                description: 'Staging server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        error: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    example: 'ERROR_CODE',
                                },
                                message: {
                                    type: 'string',
                                    example: 'Detailed error message',
                                },
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time',
                                },
                            },
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Success message',
                        },
                        data: {
                            type: 'object',
                            description: 'Response data',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        firstName: {
                            type: 'string',
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe',
                        },
                        email: {
                            type: 'string',
                            example: 'john.doe@example.com',
                        },
                        username: {
                            type: 'string',
                            example: 'johndoe',
                        },
                        userType: {
                            type: 'string',
                            enum: ['ADMIN', 'CUSTOMER'],
                            example: 'CUSTOMER',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Genre: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        genreName: {
                            type: 'string',
                            example: 'Action',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Comic: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        comicName: {
                            type: 'string',
                            example: 'Super Hero',
                        },
                        description: {
                            type: 'string',
                            example: 'A story about a super hero',
                        },
                        genreId: {
                            type: 'integer',
                            example: 1,
                        },
                        comicContent: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: {
                                        type: 'integer',
                                        example: 1,
                                    },
                                    imageURL: {
                                        type: 'string',
                                        example: 'https://example.com/image.jpg',
                                    },
                                    audioURL: {
                                        type: 'string',
                                        example: 'https://example.com/audio.mp3',
                                    },
                                    length: {
                                        type: 'number',
                                        example: 120.5,
                                    },
                                    sceneNumber: {
                                        type: 'integer',
                                        example: 1,
                                    },
                                },
                            },
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Banner: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        banner1Image: {
                            type: 'string',
                            example: 'https://example.com/banner1.jpg',
                        },
                        banner1Link: {
                            type: 'string',
                            example: 'https://example.com/link1',
                        },
                        banner2Image: {
                            type: 'string',
                            example: 'https://example.com/banner2.jpg',
                        },
                        banner2Link: {
                            type: 'string',
                            example: 'https://example.com/link2',
                        },
                        banner3Image: {
                            type: 'string',
                            example: 'https://example.com/banner3.jpg',
                        },
                        banner3Link: {
                            type: 'string',
                            example: 'https://example.com/link3',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                FileUploadResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'File uploaded successfully',
                        },
                        data: {
                            type: 'object',
                            properties: {
                                originalname: {
                                    type: 'string',
                                    example: 'example.jpg',
                                },
                                imageFileName: {
                                    type: 'string',
                                    example: 'file-1234567890.jpg',
                                },
                                audioFileName: {
                                    type: 'string',
                                    example: 'file-1234567890.jpg',
                                },
                                fileType: {
                                    type: 'string',
                                    enum: ['IMAGE', 'AUDIO'],
                                    example: 'IMAGE',
                                },
                                imageURL: {
                                    type: 'string',
                                    example: 'https://example.com/file-1234567890.jpg',
                                },
                                audioURL: {
                                    type: 'string',
                                    example: 'https://example.com/file-1234567890.jpg',
                                },
                                length: {
                                    type: 'number',
                                    description: 'Audio duration in seconds (only for AUDIO type)',
                                    example: 120.5,
                                },
                            },
                        },
                    },
                },
                ArrayFileUploadResponse: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'File uploaded successfully',
                        },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    originalname: {
                                        type: 'string',
                                        example: 'example.jpg',
                                    },
                                    imageFileName: {
                                        type: 'string',
                                        example: 'file-1234567890.jpg',
                                    },
                                    audioFileName: {
                                        type: 'string',
                                        example: 'file-1234567890.jpg',
                                    },
                                    fileType: {
                                        type: 'string',
                                        enum: ['IMAGE', 'AUDIO'],
                                        example: 'IMAGE',
                                    },
                                    imageURL: {
                                        type: 'string',
                                        example: 'https://example.com/file-1234567890.jpg',
                                    },
                                    audioURL: {
                                        type: 'string',
                                        example: 'https://example.com/file-1234567890.jpg',
                                    },
                                    length: {
                                        type: 'number',
                                        description: 'Audio duration in seconds (only for AUDIO type)',
                                        example: 120.5,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Genres',
                description: 'Genre management endpoints',
            },
            {
                name: 'Comics',
                description: 'Comic management endpoints',
            },
            {
                name: 'Banners',
                description: 'Banner management endpoints',
            },
            {
                name: 'File Upload',
                description: 'File upload endpoints',
            },
        ],
        paths: {
            // User routes
            '/user/login': {
                post: {
                    tags: ['Users'],
                    summary: 'User login',
                    description: 'Authenticate a user and return a token',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        username: {
                                            type: 'string',
                                            example: 'johndoe',
                                        },
                                        password: {
                                            type: 'string',
                                            example: 'password123',
                                        },
                                    },
                                    required: ['username', 'password'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Login successful',
                                            },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    token: {
                                                        type: 'string',
                                                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                                    },
                                                    user: {
                                                        $ref: '#/components/schemas/User',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Invalid credentials',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/user/logout': {
                get: {
                    tags: ['Users'],
                    summary: 'User logout',
                    description: 'Logout the current user',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Logout successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Logout successful',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // Genre routes
            '/genre/getAllGenres': {
                get: {
                    tags: ['Genres'],
                    summary: 'Get all genres',
                    description: 'Retrieve a list of all genres',
                    responses: {
                        '200': {
                            description: 'Genres retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Genres retrieved successfully',
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/Genre',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // Comic routes
            '/comic/getPaginatedComics': {
                get: {
                    tags: ['Comics'],
                    summary: 'Get paginated comics',
                    description: 'Retrieve a paginated list of comics with optional filtering',
                    parameters: [
                        {
                            name: 'page',
                            in: 'query',
                            description: 'Page number',
                            schema: {
                                type: 'integer',
                                default: 1,
                            },
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'Number of items per page',
                            schema: {
                                type: 'integer',
                                default: 10,
                            },
                        },
                        {
                            name: 'genreIds[]',
                            in: 'query',
                            description: 'Filter by genre ID (Array of genre IDs)',
                            schema: {
                                type: 'array',
                                items: {
                                    type: 'integer',
                                    example: 1,
                                },
                            },
                        },
                        {
                            name: 'search',
                            in: 'query',
                            description: 'Search term',
                            schema: {
                                type: 'string',
                            },
                        },
                        {
                            name: 'sort',
                            in: 'query',
                            description: 'Sort order (newest, oldest)',
                            schema: {
                                type: 'string',
                            },
                            required: false,
                            enum: ['newest', 'oldest'],
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Comics retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Comics retrieved successfully',
                                            },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    comics: {
                                                        type: 'array',
                                                        items: {
                                                            $ref: '#/components/schemas/Comic',
                                                        },
                                                    },
                                                    total: {
                                                        type: 'integer',
                                                        example: 100,
                                                    },
                                                    page: {
                                                        type: 'integer',
                                                        example: 1,
                                                    },
                                                    limit: {
                                                        type: 'integer',
                                                        example: 10,
                                                    },
                                                    totalPages: {
                                                        type: 'integer',
                                                        example: 10,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/comic/getComicDetail': {
                get: {
                    tags: ['Comics'],
                    summary: 'Get comic details',
                    description: 'Retrieve details of a specific comic',
                    parameters: [
                        {
                            name: 'comicId',
                            in: 'query',
                            description: 'ID of the comic',
                            required: true,
                            schema: {
                                type: 'integer',
                            },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Comic details retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Comic details retrieved successfully',
                                            },
                                            data: {
                                                $ref: '#/components/schemas/Comic',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '404': {
                            description: 'Comic not found',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/comic/getAdminDashboardCounts': {
                get: {
                    tags: ['Comics'],
                    summary: 'Get admin dashboard counts',
                    description: 'Retrieve counts for admin dashboard',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Dashboard counts retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Dashboard counts retrieved successfully',
                                            },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    totalComics: {
                                                        type: 'integer',
                                                        example: 100,
                                                    },
                                                    totalGenres: {
                                                        type: 'integer',
                                                        example: 10,
                                                    },
                                                    totalUsers: {
                                                        type: 'integer',
                                                        example: 50,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/comic/addNewComic': {
                post: {
                    tags: ['Comics'],
                    summary: 'Add a new comic',
                    description: 'Create a new comic with content',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        comicName: {
                                            type: 'string',
                                            example: 'Super Hero',
                                        },
                                        description: {
                                            type: 'string',
                                            example: 'A story about a super hero',
                                        },
                                        genreId: {
                                            type: 'integer',
                                            example: 1,
                                        },
                                        comicContent: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    imageURL: {
                                                        type: 'string',
                                                        example: 'https://example.com/image.jpg',
                                                    },
                                                    audioURL: {
                                                        type: 'string',
                                                        example: 'https://example.com/audio.mp3',
                                                    },
                                                    length: {
                                                        type: 'number',
                                                        example: 120.5,
                                                    },
                                                    sceneNumber: {
                                                        type: 'integer',
                                                        example: 1,
                                                    },
                                                },
                                                required: ['imageURL', 'audioURL', 'length', 'sceneNumber'],
                                            },
                                        },
                                    },
                                    required: ['comicName', 'description', 'genreId', 'comicContent'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Comic created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Comic created successfully',
                                            },
                                            data: {
                                                $ref: '#/components/schemas/Comic',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/comic/updateComic': {
                post: {
                    tags: ['Comics'],
                    summary: 'Update a comic',
                    description: 'Update an existing comic with content',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        comicId: {
                                            type: 'integer',
                                            example: 1,
                                        },
                                        comicName: {
                                            type: 'string',
                                            example: 'Super Hero',
                                        },
                                        description: {
                                            type: 'string',
                                            example: 'A story about a super hero',
                                        },
                                        genreId: {
                                            type: 'integer',
                                            example: 1,
                                        },
                                        comicContent: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    imageURL: {
                                                        type: 'string',
                                                        example: 'https://example.com/image.jpg',
                                                    },
                                                    audioURL: {
                                                        type: 'string',
                                                        example: 'https://example.com/audio.mp3',
                                                    },
                                                    length: {
                                                        type: 'number',
                                                        example: 120.5,
                                                    },
                                                    sceneNumber: {
                                                        type: 'integer',
                                                        example: 1,
                                                    },
                                                },
                                                required: ['imageURL', 'audioURL', 'length', 'sceneNumber'],
                                            },
                                        },
                                    },
                                    required: ['comicId', 'comicName', 'description', 'genreId', 'comicContent'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Comic updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Comic updated successfully',
                                            },
                                            data: {
                                                $ref: '#/components/schemas/Comic',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '404': {
                            description: 'Comic not found',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/comic/deleteComic': {
                get: {
                    tags: ['Comics'],
                    summary: 'Delete a comic',
                    description: 'Delete an existing comic',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    parameters: [
                        {
                            name: 'comicIds[]',
                            in: 'query',
                            description: 'Filter by comic ID (Array of comic IDs)',
                            schema: {
                                type: 'array',
                                items: {
                                    type: 'integer',
                                    example: 1,
                                },
                            },
                        },
                    ],
                    responses: {
                        '200': {
                            description: 'Comic deleted successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Comic deleted successfully',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '404': {
                            description: 'Comic not found',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // Banner routes
            '/banner/getAllBanners': {
                get: {
                    tags: ['Banners'],
                    summary: 'Get all banners',
                    description: 'Retrieve a list of all banners',
                    responses: {
                        '200': {
                            description: 'Banners retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Banners retrieved successfully',
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/Banner',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/banner/saveBanner': {
                post: {
                    tags: ['Banners'],
                    summary: 'Save banner',
                    description: 'Save or update banner information',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'integer',
                                            example: 1,
                                        },
                                        banner1Image: {
                                            type: 'string',
                                            example: 'https://example.com/banner1.jpg',
                                        },
                                        banner1Link: {
                                            type: 'string',
                                            example: 'https://example.com/link1',
                                        },
                                        banner2Image: {
                                            type: 'string',
                                            example: 'https://example.com/banner2.jpg',
                                        },
                                        banner2Link: {
                                            type: 'string',
                                            example: 'https://example.com/link2',
                                        },
                                        banner3Image: {
                                            type: 'string',
                                            example: 'https://example.com/banner3.jpg',
                                        },
                                        banner3Link: {
                                            type: 'string',
                                            example: 'https://example.com/link3',
                                        },
                                    },
                                    required: ['id', 'banner1Image', 'banner1Link', 'banner2Image', 'banner2Link', 'banner3Image', 'banner3Link'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Banner saved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'boolean',
                                                example: true,
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'Banner saved successfully',
                                            },
                                            data: {
                                                $ref: '#/components/schemas/Banner',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },

            // File upload routes
            '/upload/uploadFile': {
                post: {
                    tags: ['File Upload'],
                    summary: 'Upload a file',
                    description: 'Upload a file to the server',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'The file to upload',
                                        },
                                        fileType: {
                                            type: 'string',
                                            enum: ['IMAGE', 'AUDIO'],
                                            description: 'Type of file being uploaded',
                                            example: 'IMAGE',
                                        },
                                    },
                                    required: ['file', 'fileType'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'File uploaded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/FileUploadResponse',
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input or file not uploaded',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/upload/uploadFileArray': {
                post: {
                    tags: ['File Upload Array'],
                    summary: 'Upload a file array',
                    description: 'Upload a file array to the server',
                    security: [
                        {
                            bearerAuth: [],
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                            },
                                            format: 'binary',
                                            description: 'The file array to upload',
                                        },
                                        fileType: {
                                            type: 'string',
                                            enum: ['IMAGE', 'AUDIO'],
                                            description: 'Type of file being uploaded',
                                            example: 'IMAGE',
                                        },
                                    },
                                    required: ['file', 'fileType'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Files uploaded successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ArrayFileUploadResponse',
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Invalid input or file not uploaded',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                        '401': {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: [],
};

module.exports = swaggerJsdoc(options);