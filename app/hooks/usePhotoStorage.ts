import { useCallback } from "react";

/**
 * usePhotoStorage
 * 负责保存照片到本地（localStorage 或 IndexedDB），可根据需要扩展为上传到服务器
 * 暴露 savePhoto 方法，接收 base64 或 blob
 */
export function usePhotoStorage() {
  // 保存照片到 localStorage（可替换为更持久的存储方案）
  const savePhoto = useCallback((photoUrl: string) => {
    // 生成唯一 key
    const key = `photo_${Date.now()}`;
    // 读取已有照片列表
    const photoList = JSON.parse(localStorage.getItem("photoList") || "[]");
    photoList.push({ key, url: photoUrl, date: new Date().toISOString() });
    localStorage.setItem("photoList", JSON.stringify(photoList));
  }, []);

  return { savePhoto };
}
