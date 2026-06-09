Cấu trúc dự án này có 4 tầng:

1. 🎯 Domain Layer (Tầng Domain)
Vị trí: domain

Đây là tầng trung tâm chứa business logic thuần túy, không phụ thuộc vào framework hay thư viện bên ngoài.

Cấu trúc:
entities/ -  Khai báo các thực thể nghiệp vụ:
ex:
export interface Movie {
  _id: string;
  title: string;
  subTitle: string;
  description: string;
  duration: number;
  releaseDate: string;
  position: number;
  endDate: string;
  rating: number;
  limitAge: number;
  versionsResult: MovieVersion[];
  genresResult: MovieGenre[];
  language: string;
  members: MovieMember[];
  trailerUrl: string;
  status: string ;
  posterImage: File | string | null;
  createdAt: string;
  updatedAt: string;
  slug: string;
}

dto/ - Data Transfer Objects
Đây là nơi như là cái khung của data khi f12 lên thấy data có những gì thì dto của API Response sẽ như vậy. Nhiều Response thì có nhiều dto của các thực thể khác nhau
ex:
export interface ApiResponse<T = any> {
  status: "success" | "fail";
  message: string;
  data?: T | null;
  length?: number;
  error: any | null;
  success: Boolean;
  refreshToken?: string | null;
  accessToken?: string | null;
}

Repositories:
Đóng vai trò gateway giữa Domain layer (entities, usecases) và Infrastructure layer (API, DB, external service).

Giúp cách ly code nghiệp vụ khỏi cách dữ liệu được lưu trữ hay lấy ra (REST API, GraphQL, localStorage, DB...).
Ex:
import { Movie, MovieListResponse,MovieMember } from "@/domain/entities/Movie";
import { ApiResponse } from "@/domain/dto/api/ApiResponse";

export interface MovieRepository {
    getAllMovies(): Promise<MovieListResponse>;
    getAllMoviesByAdmin(params:{page:number; limit:number}): Promise<ApiResponse<MovieListResponse>>;
    createMovie(movie: FormData): Promise<ApiResponse>;
    updateMovie(id: string, movie: FormData): Promise<ApiResponse>;
    changePosition(id: string, position: number): Promise<ApiResponse>;
    changeStatus(id: string, status: string): Promise<ApiResponse>;
    changeMulti(ids: string[], status: string): Promise<ApiResponse<null>>;
    deleteMovie(id: string): Promise<ApiResponse<null>>;
    getMovieDetailById(id: string): Promise<ApiResponse<Movie>>;
    getUpcomingMovies(): Promise<Movie[]>;
}

2. ⚙️ Application Layer (Tầng Application)
Vị trí: application

Tầng này điều phối và xử lý các use case của ứng dụng.

Cấu trúc:
usecases/ - Các use case cụ thể:

services/ - Redux async thunks:
Ex:
// Lấy chi tiết phim
export const fetchMovieById = createAsyncThunk(
  "movies/fetch",
  async (id: string) => {
    const useCase = new GetMovieDetailById(movieRepositoryImpl);
    return useCase.execute(id);
  }
);

authService.ts, movieService.ts
bookingService.ts, showtimeService.ts

slices/ - Redux slices (state management)

store/ - Redux store configuration

hooks/ - Custom hooks

3. 🔌 Infrastructure Layer (Tầng Infrastructure)
Vị trí: infrastructure

Tầng này implement các interface từ domain layer và xử lý các external concerns.

Cấu trúc:
repositories/ - Implementation của domain repositories:
Ex:
  async getAllMovies(): Promise<MovieListResponse> {
    return movieAPI.getAllMovies();
  }

api/ - HTTP API calls: xử lý exception của API
  async getAllMovies(): Promise<MovieListResponse> {
    try {
      const res = await axiosInstance.get(UserEndpoint);
      if (res.status !== 200) {
        throw new Error("Failed to fetch movies");
      }
      return res.data as MovieListResponse;
    } catch (error) {
      throw error;
    }
  },

socket/ - WebSocket connections

4. 🖼️ Presentation Layer (Tầng Presentation)
Vị trí: app, presentation

Tầng này xử lý giao diện người dùng và tương tác.

5. ⚙️ Configuration Layer
Vị trí: config

axiosInstance.ts - HTTP client configuration
cognitoConfig.ts - AWS Cognito setup
cognitoHostedUiDomain.ts - Authentication domain