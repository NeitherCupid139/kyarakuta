import supabase from "@/app/lib/supabase";

/**
 * Supabase Storage 工具函数
 * 提供图片上传和获取功能
 */

/**
 * 上传图片到 Supabase Storage
 * @param file 要上传的文件
 * @param bucket 存储桶名称，默认为 'kyarakuta'
 * @param folder 文件夹路径，默认为 'covers'
 * @returns 上传后的图片URL
 */
export async function uploadImage(
	file: File,
	bucket: string = "kyarakuta",
	folder: string = "covers"
): Promise<string> {
	try {
		// 检查 Supabase 客户端是否已初始化
		if (!supabase) {
			console.error("Supabase 客户端未初始化");
			throw new Error("Supabase 客户端未初始化");
		}

		// 检查存储桶是否存在
		const { data: buckets, error: bucketsError } =
			await supabase.storage.listBuckets();
		if (bucketsError) {
			console.error("获取存储桶列表失败:", bucketsError);
			throw bucketsError;
		}

		const bucketExists = buckets.some((b) => b.name === bucket);
		if (!bucketExists) {
			console.error(`存储桶 "${bucket}" 不存在`);
			throw new Error(`存储桶 "${bucket}" 不存在`);
		}

		// 生成唯一文件名
		const fileExt = file.name.split(".").pop();
		const fileName = `${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 15)}.${fileExt}`;
		const filePath = `${folder}/${fileName}`;

		console.log(`准备上传文件: ${filePath}, 大小: ${file.size} 字节`);

		// 上传文件到 Supabase Storage
		const { error } = await supabase.storage
			.from(bucket)
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			console.error("上传图片失败:", error);
			throw error;
		}

		console.log(`文件上传成功: ${filePath}`);

		// 获取公共URL
		const { data: urlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(filePath);

		return urlData.publicUrl;
	} catch (error) {
		console.error("上传图片失败:", error);
		// 返回更详细的错误信息
		if (error instanceof Error) {
			throw new Error(`上传图片失败: ${error.message}`);
		} else {
			throw new Error(`上传图片失败: ${JSON.stringify(error)}`);
		}
	}
}

/**
 * 从 Supabase Storage 删除图片
 * @param url 图片URL
 * @param bucket 存储桶名称，默认为 'kyarakuta'
 * @returns 是否删除成功
 */
export async function deleteImage(
	url: string,
	bucket: string = "kyarakuta"
): Promise<boolean> {
	try {
		// 从URL中提取文件路径
		const urlObj = new URL(url);
		const pathSegments = urlObj.pathname.split("/");
		const filePath = pathSegments
			.slice(pathSegments.indexOf(bucket) + 1)
			.join("/");

		// 删除文件
		const { error } = await supabase.storage.from(bucket).remove([filePath]);

		if (error) {
			console.error("删除图片失败:", error);
			return false;
		}

		return true;
	} catch (error) {
		console.error("删除图片失败:", error);
		return false;
	}
}
