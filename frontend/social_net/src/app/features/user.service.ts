import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { UserDto } from '../entities/user.types';
import { PostDto } from '../entities/post.types';
import { InteractionDto } from '../entities/interaction.types';


@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }


    getUserByNickname(userNickname: string): Observable<UserDto> {
        return this.http.get<UserDto>(`http://localhost:3000/user/${encodeURIComponent(userNickname)}`, {withCredentials: true});
    }

    // async getNicknameById(id: string): string {
    //     return await firstValueFrom(this.http.get<string>(`http://localhost:3000/user/${encodeURIComponent(userNickname)}`, {withCredentials: true}));
    // }

    getMessages(peerNickname: string, limit: number = 100 ): Observable<Message[]> {
        return this.http.get<Message[]>(`http://localhost:3000/messages?peerNickname=${encodeURIComponent(peerNickname)}&limit=${encodeURIComponent(limit)}`, {withCredentials: true});
    }

    getUserById(): Observable<UserDto> {
        return this.http.get<UserDto>(`http://localhost:3000/user/account/`, {withCredentials: true});
    }

    // getUser(userNickname: string): Observable<UserDto> {
    //     return this.http.get<UserDto>(`/api/users/${encodeURIComponent(userNickname)}`);
    // }

    getUserPosts(userId: string, limit = 20): Observable<PostDto[]> {
        const params = new HttpParams().set('limit', String(limit));
        return this.http.get<PostDto[]>(`/api/users/${encodeURIComponent(userId)}/posts`, { params });
    }


    getRecentInteractions(userId: string, limit = 10): Observable<InteractionDto[]> {
        const params = new HttpParams().set('limit', String(limit));
        return this.http.get<InteractionDto[]>(`/api/users/${encodeURIComponent(userId)}/interactions`, { params });
    }
}