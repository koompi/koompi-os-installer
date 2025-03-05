#!/bin/bash
set -e  # Exit on error

# === CONFIGURATION ===
DISK="/dev/sdX"  # CHANGE THIS to the target disk (e.g., /dev/sda or /dev/nvme0n1)
AIROOTFS="/run/archiso/bootmnt/arch/x86_64/airootfs.sfs"
HOSTNAME="archlinux"
ROOT_PASSWORD="password"  # CHANGE THIS

# === CHECK REQUIREMENTS ===
if [[ ! -f "$AIROOTFS" ]]; then
    echo "Error: airootfs.sfs not found at $AIROOTFS"
    exit 1
fi

# === WIPE & PARTITION DISK ===
echo "Wiping $DISK and creating partitions..."
parted "$DISK" --script mklabel gpt  # Create a new GPT partition table

# Create EFI partition (512MB)
parted "$DISK" --script mkpart primary fat32 1MiB 513MiB
parted "$DISK" --script set 1 boot on  # Set boot flag on the EFI partition

# Create root partition (rest of the disk)
parted "$DISK" --script mkpart primary ext4 513MiB 100%

# Set partition variables
EFI_PART="${DISK}1"
ROOT_PART="${DISK}2"

# Format partitions
mkfs.fat -F32 "$EFI_PART"
mkfs.ext4 -F "$ROOT_PART"

# Mount partitions
mount "$ROOT_PART" /mnt
mkdir -p /mnt/boot
mount "$EFI_PART" /mnt/boot

# === EXTRACT ROOTFS ===
echo "Extracting airootfs.sfs to /mnt..."
unsquashfs -f -d /mnt "$AIROOTFS"

# Generate fstab
genfstab -U /mnt >> /mnt/etc/fstab

# === SETUP CHROOT ===
echo "Setting up chroot..."
arch-chroot /mnt bash <<EOF
# Set hostname
echo "$HOSTNAME" > /etc/hostname

# Set root password
echo "root:$ROOT_PASSWORD" | chpasswd

# Regenerate initramfs
mkinitcpio -P

# Install GRUB for UEFI
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

# Enable essential services
systemctl enable systemd-networkd
systemctl enable systemd-resolved
EOF

# Unmount and reboot
umount -R /mnt
echo "Installation complete! Rebooting..."
reboot
