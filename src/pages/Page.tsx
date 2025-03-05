import { GlobeDemo } from "@/components/BannerGlobe";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlockDeviceInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export default function Home() {
  const [config, setConfig] = useState({
    user: "",
    passwd: "",
    disk: "",
  });

  const { data, status, error } = useQuery({
    queryKey: ["block_devices"],
    queryFn: async () => {
      return (await invoke("get_block_devices")) as BlockDeviceInfo;
    },
  });

  if (status === "pending") {
    return <div>Loading</div>;
  }

  if (status === "error") {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <div className="w-lg space-y-6 mx-auto p-4 h-auto">
        <GlobeDemo />
        <div className="space-y-2">
          <h2 className="font-black text-muted-foreground">Select Disk</h2>
          {data.blockdevices
            .filter(
              (block) =>
                block.type === "disk" &&
                block.size.includes("G") &&
                parseFloat(block.size.replace("G", "")) > 32 &&
                (block.name.startsWith("nvme") ||
                  block.name.startsWith("sd") ||
                  block.name.startsWith("mmc"))
            )
            .map((block) => (
              <Label
                className="border p-2 rounded-sm flex place-content-between"
                key={block.name}
              >
                <div className="flex gap-2 place-items-center">
                  <Checkbox
                    checked={config.disk === block.name}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setConfig({
                          ...config,
                          disk: block.name,
                        });
                      }
                    }}
                  />{" "}
                  <div className="flex flex-col gap-1">
                    <span>{block.model}</span>
                    <span>/dev/{block.name}</span>
                  </div>
                </div>
                <span>{block.size}</span>
              </Label>
            ))}
        </div>

        <div className="space-y-2">
          <h2 className="font-black text-muted-foreground">Partition Table</h2>
          <Label className="border p-2 rounded-sm flex place-content-between">
            <span>/boot/efi</span>
            <div className="space-x-4">
              <span>1%</span>
              <span>ext4</span>
            </div>
          </Label>
          <Label className="border p-2 rounded-sm flex place-content-between">
            <span>/</span>
            <div className="space-x-4">
              <span>30%</span>
              <span>ext4</span>
            </div>
          </Label>
          <Label className="border p-2 rounded-sm flex place-content-between">
            <span>/home</span>
            <div className="space-x-4">
              <span>69%</span>
              <span>ext4</span>
            </div>
          </Label>
        </div>
        <div className="space-y-2">
          <h2 className="font-black text-muted-foreground">User Account</h2>
          <Input
            placeholder="User"
            value={config.user}
            onChange={(e) => setConfig({ ...config, user: e.target.value })}
          />
          <Input
            placeholder="Password"
            value={config.passwd}
            onChange={(e) => setConfig({ ...config, passwd: e.target.value })}
          />
        </div>

        <Button
          className="w-full"
          onClick={async () => {}}
          disabled={
            config.disk === "" || config.user === "" || config.passwd === ""
          }
        >
          INSTALL
        </Button>
      </div>
    </>
  );
}
