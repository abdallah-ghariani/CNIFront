import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { map, mergeMap, Observable } from "rxjs";
import { Documentation } from "../models/documentation";

const BACKEND_URL = environment.BACKEND_URL + "documentation";

@Injectable({
  providedIn: "root",
})
export class DocumentationService {
  download(id: string) {
    return this.http.get(BACKEND_URL + "/download/" + id, { responseType: 'blob' });
  }

  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Documentation[]> {
    return this.http.get<Documentation[]>(BACKEND_URL);
  }

  upload(
    document: Omit<Documentation, "id" | "fileUrl" | "uploadedAt">,
    file: File
  ) {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<Documentation>(BACKEND_URL, document).pipe(
      mergeMap((doc) =>
        this.http.post(BACKEND_URL + "/upload/" + doc.id, formData, {
          reportProgress: true,
          observe: "events",
        })
      )
    );
  }

  delete(id: string) {
    return this.http.delete<void>(BACKEND_URL + `/${id}`);
  }
}
