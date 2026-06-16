package com.peredoro.swipegalery;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 123;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(MediaScannerPlugin.class);
    }

    @Override
    public void onResume() {
        super.onResume();
        checkAndRequestStoragePermissions();
    }

    private void checkAndRequestStoragePermissions() {

        // Android 11+ (API 30+): pede acesso total ao armazenamento
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                try {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                    Uri uri = Uri.fromParts("package", getPackageName(), null);
                    intent.setData(uri);
                    startActivity(intent);
                } catch (Exception e) {
                    startActivity(new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION));
                }
                return; // aguarda o usuário voltar pro app antes de pedir o resto
            }
        }

        // Android 13+ (API 33+): permissões granulares de mídia
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            List<String> needed = new ArrayList<>();

            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.READ_MEDIA_IMAGES);
            }
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_VIDEO)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.READ_MEDIA_VIDEO);
            }

            if (!needed.isEmpty()) {
                ActivityCompat.requestPermissions(this,
                    needed.toArray(new String[0]),
                    PERMISSION_REQUEST_CODE);
            }

        // Android 10 e abaixo (API 29-)
        } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            List<String> needed = new ArrayList<>();

            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.READ_EXTERNAL_STORAGE);
            }
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }

            if (!needed.isEmpty()) {
                ActivityCompat.requestPermissions(this,
                    needed.toArray(new String[0]),
                    PERMISSION_REQUEST_CODE);
            }
        }
    }
}