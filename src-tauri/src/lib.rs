// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde_json::{json, Value};
use tokio::io::AsyncReadExt;
use tokio::process::Command;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockDeviceInfo {
    pub blockdevices: Vec<BlockDevice>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockDevice {
    pub name: String,
    pub size: String,
    pub r#type: String,
    pub mountpoint: Option<String>,
    pub vendor: Option<String>,
    pub model: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<BlockDevice>>,
}

#[tauri::command]
async fn get_block_devices() -> std::result::Result<Value, String> {
    let cmd = Command::new("lsblk")
        .args(vec!["-o", "NAME,SIZE,TYPE,MOUNTPOINT,VENDOR,MODEL", "-J"])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    serde_json::from_str(&buffer).map_err(|e| e.to_string())
}

#[tauri::command]
async fn make_partition_table(name: String) -> std::result::Result<Value, String> {
    let disk_name = format!("/dev/{name}");

    let script = format!(
        r#"
    #!/bin/bash
    parted {disk_name} mklabel gpt --script;
    parted {disk_name} mkpart "EFI" fat32 0% 1G --script;
    parted {disk_name} set 1 esp on;
    parted {disk_name} mkpart "ROOT" ext4 1G 30% --script;
    parted {disk_name} mkpart "HOME" ext4 30% 99% --script;
    "#
    );

    let cmd = Command::new("/usr/bin/sudo")
        .args(vec!["bash", "-c", &script])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    println!("make_partition_table {}", buffer);

    Ok(json!({ "status": "success" }))
}

#[tauri::command]
async fn format_partitions(partitions: Vec<BlockDevice>) -> std::result::Result<Value, String> {
    let mut boot = String::new();
    let mut root = String::new();
    let mut home = String::new();

    partitions.iter().enumerate().for_each(|(index, part)| {
        if index == 0 {
            boot = format!("/dev/{}", part.name);
        }
        if index == 1 {
            root = format!("/dev/{}", part.name);
        }
        if index == 2 {
            home = format!("/dev/{}", part.name);
        }
    });

    let script = format!(
        r#"
    #!/bin/bash
    mkfs.fat -F32 {boot};
    mkfs.ext4 {root};
    mkfs.ext4 {home};

    mount {root} /mnt
    mkdir -p /mnt/home
    mkdir -p /mnt/boot
    mount {home} /mnt/home
    mount {boot} /mnt/boot
    "#
    );

    let cmd = Command::new("/usr/bin/sudo")
        .args(vec!["bash", "-c", &script])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    println!("format_partitions {}", buffer);

    Ok(json!({ "status": "success" }))
}

#[tauri::command]
async fn unpackfs() -> std::result::Result<Value, String> {
    let script = format!(
        r#"
    #!/bin/bash
    unsquashfs -f -d /mnt /run/archiso/copytoram/airootfs.sfs;
    "#
    );

    let cmd = Command::new("/usr/bin/sudo")
        .args(vec!["bash", "-c", &script])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    println!("unpackfs {}", buffer);

    Ok(json!({ "status": "success" }))
}

#[tauri::command]
async fn config_root() -> std::result::Result<Value, String> {
    let script = format!(
        r#"
    #!/bin/bash
    genfstab -U -p /mnt >> /mnt/etc/fstab
    arch-chroot /mnt /usr/bin/oem_setup.sh
    umount -a
    "#
    );

    let cmd = Command::new("/usr/bin/sudo")
        .args(vec!["bash", "-c", &script])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    println!("unpackfs {}", buffer);

    Ok(json!({ "status": "success" }))
}

#[tauri::command]
async fn reboot() -> std::result::Result<Value, String> {
    let script = format!(
        r#"
    #!/bin/bash
    reboot
    "#
    );

    let cmd = Command::new("/usr/bin/sudo")
        .args(vec!["bash", "-c", &script])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    println!("unpackfs {}", buffer);

    Ok(json!({ "status": "success" }))
}

#[tauri::command]
async fn get_mode() -> std::result::Result<Option<String>, String> {
    let args: Vec<String> = std::env::args().collect();
    Ok(args.into_iter().nth(1))
}

#[tauri::command]
async fn create_account(user: String, passwd: String) -> std::result::Result<(), String> {
    let script = format!(
        r#"
    #!/bin/bash
    sudo useradd -mg users -G wheel,power,storage,input -s /bin/bash --password $(openssl passwd -6 "{passwd}") {user}
    # remove setup files
    sudo rm -rf /usr/bin/koompi-os-installer /usr/bin/oem_setup.sh /etc/sudoers.d/live /etc/sudoers.d/live
    
    # remove autologin
    sudo sed -i '/Autologin/Id' /etc/sddm.conf.d/kde_settings.conf
    sudo sed -i '/Relogin=true/Id' /etc/sddm.conf.d/kde_settings.conf
    sudo sed -i '/Session=plasma/Id' /etc/sddm.conf.d/kde_settings.conf
    sudo sed -i '/User=/Id' /etc/sddm.conf.d/kde_settings.conf

    sudo userdel -r -f live
    sudo userdel -r -f oem
    reboot
    "#
    );

    let cmd = Command::new("/usr/bin/sudo")
        .args(vec!["bash", "-c", &script])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    let mut buffer = String::new();

    cmd.stdout
        .as_slice()
        .read_to_string(&mut buffer)
        .await
        .map_err(|e| e.to_string())?;

    println!("unpackfs {}", buffer);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_block_devices,
            make_partition_table,
            format_partitions,
            unpackfs,
            config_root,
            reboot,
            get_mode,
            create_account
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
