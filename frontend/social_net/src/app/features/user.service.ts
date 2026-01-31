import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Friend, User, UserDto } from '../entities/user.types';
import { PostDto } from '../entities/post.types';
import { Message } from '../entities/message';


@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }


    getUserByNickname(userNickname: string): Observable<UserDto> {
        return this.http.get<UserDto>(`http://localhost:3000/user/${encodeURIComponent(userNickname)}`, { withCredentials: true });
    }

    // async getNicknameById(id: string): string {
    //     return await firstValueFrom(this.http.get<string>(`http://localhost:3000/user/${encodeURIComponent(userNickname)}`, {withCredentials: true}));
    // }

    getMessages(peerNickname: string, limit: number = 100): Observable<Message[]> {
        return this.http.get<Message[]>(`http://localhost:3000/messages?peerNickname=${encodeURIComponent(peerNickname)}&limit=${encodeURIComponent(limit)}`, { withCredentials: true });
    }

    getUserById(): Observable<unknown> {
        return this.http.get<unknown>(`http://localhost:3000/user/account/`, { withCredentials: true });
    }

    getFriends(): Observable<Friend[]> {
        return this.http.get<Friend[]>(`http://localhost:3000/user/friends`, {
            withCredentials: true,
        });
    }
    findPersonByNickname(nickname?: string): Observable<User[]> {
        if (!nickname) return this.http.get<User[]>(`http://localhost:3000/user/people`, {
            withCredentials: true,
        });
        return this.http.get<User[]>(`http://localhost:3000/user/people?nickname=${encodeURIComponent(nickname)}`, {
            withCredentials: true,
        });
    }
     sendFriendRequest(addresseeId: string): Observable<any> {
    return this.http.post('http://localhost:3000/user/friends', { addresseeId }, { withCredentials: true } );
  }

  // Remove friendship (friendId)
  removeFriend(friendId: string): Observable<any> {
    return this.http.post('http://localhost:3000/user/friends/remove', { friendId }, { withCredentials: true } );
  }
    // getUser(userNickname: string): Observable<UserDto> {
    //     return this.http.get<UserDto>(`/api/users/${encodeURIComponent(userNickname)}`);
    // }

    getUserPosts(userId: string, limit = 20): Observable<PostDto[]> {
        const params = new HttpParams().set('limit', String(limit));
        return this.http.get<PostDto[]>(`/api/users/${encodeURIComponent(userId)}/posts`, { params });
    }
}