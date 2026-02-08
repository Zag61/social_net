import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Friend, User, UserDto } from '../entities/user.types';
import { PostDto } from '../entities/post.types';
import { Message } from '../entities/message';
import { environment } from '../../environment';


@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }


    getUserByNickname(userNickname: string): Observable<UserDto> {
        return this.http.get<UserDto>(`${environment.apiBaseUrl}/user/${encodeURIComponent(userNickname)}`, { withCredentials: true });
    }

    getMessages(peerNickname: string, limit: number = 100): Observable<Message[]> {
        return this.http.get<Message[]>(`${environment.apiBaseUrl}/messages?peerNickname=${encodeURIComponent(peerNickname)}&limit=${encodeURIComponent(limit)}`, { withCredentials: true });
    }

    getUserById(): Observable<unknown> {
        return this.http.get<unknown>(`${environment.apiBaseUrl}/user/account/`, { withCredentials: true });
    }

    getFriends(): Observable<Friend[]> {
        return this.http.get<Friend[]>(`${environment.apiBaseUrl}/user/friends`, {
            withCredentials: true,
        });
    }
    findPersonByNickname(nickname?: string): Observable<User[]> {
        if (!nickname) return this.http.get<User[]>(`${environment.apiBaseUrl}/user/people`, {
            withCredentials: true,
        });
        return this.http.get<User[]>(`${environment.apiBaseUrl}/user/people?nickname=${encodeURIComponent(nickname)}`, {
            withCredentials: true,
        });
    }
    sendFriendRequest(addresseeId: string): Observable<any> {
        return this.http.post(`${environment.apiBaseUrl}/user/friends`, { addresseeId }, { withCredentials: true });
    }

    // Remove friendship (friendId)
    removeFriend(friendId: string): Observable<any> {
        return this.http.post(`${environment.apiBaseUrl}/user/friends/remove`, { friendId }, { withCredentials: true });
    }
}