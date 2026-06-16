package com.peredoro.swipegalery;

import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaScanner")
public class MediaScannerPlugin extends Plugin {

    @PluginMethod
    public void scanMediaFiles(PluginCall call) {
        try {
            JSArray mediaFiles = new JSArray();
            
            queryMediaStore(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, false, mediaFiles);
            queryMediaStore(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, true, mediaFiles);
            
            JSObject response = new JSObject();
            response.put("files", mediaFiles);
            response.put("debug_total", mediaFiles.length());
            call.resolve(response);
        } catch (Exception e) {
            call.reject("Erro ao escanear mídias do celular: " + e.getMessage());
        }
    }

    private void queryMediaStore(Uri contentUri, boolean isVideo, JSArray resultList) {
        String[] projection = {
            MediaStore.MediaColumns.DATA,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.DATE_MODIFIED,
            MediaStore.MediaColumns.MIME_TYPE
        };

        // Sort by date modified descending
        String sortOrder = MediaStore.MediaColumns.DATE_MODIFIED + " DESC";

        Cursor cursor = getContext().getContentResolver().query(
            contentUri,
            projection,
            null,
            null,
            sortOrder
        );

        if (cursor != null) {
            int dataIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
            int nameIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME);
            int sizeIndex = cursor.getColumnIndex(MediaStore.MediaColumns.SIZE);
            int dateIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_MODIFIED);
            int mimeIndex = cursor.getColumnIndex(MediaStore.MediaColumns.MIME_TYPE);

            while (cursor.moveToNext()) {
                // Check if indices are valid
                if (dataIndex == -1 || nameIndex == -1) continue;

                String path = cursor.getString(dataIndex);
                String name = cursor.getString(nameIndex);
                
                if (path == null || name == null) continue;

                // Ignore files that are in our custom trash folder so they don't show in gallery
                if (path.contains("Lixeira_Swipe")) {
                    continue;
                }

                long size = sizeIndex != -1 ? cursor.getLong(sizeIndex) : 0;
                long dateModified = dateIndex != -1 ? cursor.getLong(dateIndex) : 0;
                String mimeType = mimeIndex != -1 ? cursor.getString(mimeIndex) : "";

                JSObject fileObj = new JSObject();
                fileObj.put("path", path);
                fileObj.put("name", name);
                fileObj.put("size", size);
                fileObj.put("mtime", dateModified * 1000); // Convert to milliseconds
                fileObj.put("mimeType", mimeType);
                fileObj.put("isVideo", isVideo);

                resultList.put(fileObj);
            }
            cursor.close();
        }
    }
}
