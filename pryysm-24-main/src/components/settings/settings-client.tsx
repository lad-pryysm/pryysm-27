
"use client"

import React, { useState, useRef, useEffect } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Settings, User, CreditCard, LogOut, Archive, Download, Upload, RotateCw, History, FileDown, FileUp, KeyRound, Copy, Trash2, PenLine, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parseCsv } from '@/lib/csv-parser'
import { useWorkspace, type CodeSettings, type Document } from '@/hooks/use-workspace'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Textarea } from '../ui/textarea'


export function SettingsClient() {
    const { toast } = useToast();
    const { user, updateUserProfile, logout } = useAuth();
    const { workspaceData, documents, customers, codeSettings: initialCodeSettings, updateCodeSettings, supportTickets, addSupportTicket } = useWorkspace();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const workspaceImportRef = useRef<HTMLInputElement>(null);
    const profileImageRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<string | null>(null);

    const [profile, setProfile] = useState({
        name: user?.name || 'Admin User',
        email: user?.email || 'admin@prysm.com',
        avatar: user?.avatar || '',
        currentPassword: '',
        newPassword: ''
    });
    
    const [backupFrequency, setBackupFrequency] = useState('weekly');
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [permissions, setPermissions] = useState({
        readData: true,
        writeData: false,
        manageOrders: true,
        accessFinancials: false,
    });
    const [codeSettings, setCodeSettings] = useState(initialCodeSettings);
    
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');

    useEffect(() => {
        setCodeSettings(initialCodeSettings);
    }, [initialCodeSettings]);

    const handleProfileChange = (field: keyof typeof profile, value: string) => {
        setProfile(prev => ({...prev, [field]: value}));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    handleProfileChange('avatar', event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            updateUserProfile({ name: profile.name, email: profile.email, avatar: profile.avatar });
        }
        toast({
            title: 'Profile Updated',
            description: 'Your profile information has been saved.'
        });
    }

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile.currentPassword || !profile.newPassword) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please enter both your current and new password.'
            });
            return;
        }
        toast({
            title: 'Password Updated',
            description: 'Your password has been changed successfully.'
        });
        setProfile(prev => ({ ...prev, currentPassword: '', newPassword: ''}));
    }
    
    const handleCodeSettingChange = (key: keyof CodeSettings, value: string) => {
        setCodeSettings(prev => ({...prev, [key]: value}));
    };

    const handleSaveCodeSettings = () => {
        updateCodeSettings(codeSettings);
        toast({
            title: 'Code Settings Updated',
            description: 'Your custom code prefixes have been saved.'
        });
    }

    const handleSignOut = () => {
        logout();
        router.push('/login');
    }
    
    const downloadCSV = (filename: string, headers: string[], dataRows: string[][]) => {
        const headerString = headers.join(',');
        const rowsString = dataRows.map(row => 
            row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const csvContent = `data:text/csv;charset=utf-8,${headerString}\n${rowsString}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Export Complete",
            description: `${filename}.csv has been downloaded.`
        });
    };

    const handleExportWorkspace = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspaceData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `pryysm_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        toast({
            title: "Workspace Exported",
            description: "A backup file has been downloaded."
        });
    }
    
    const handleImportWorkspace = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                const data = JSON.parse(text as string);
                
                // Here, you would dispatch actions to update your application state
                // For now, we simulate success by logging and showing a toast
                console.log("Imported workspace data:", data);

                if (!data.printers || !data.schedule) {
                    throw new Error("Invalid backup file format.");
                }

                toast({
                    title: "Workspace Imported",
                    description: `Successfully parsed backup from ${new Date(data.timestamp).toLocaleString()}. The app state would now be overwritten.`,
                });
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: "The selected file is not a valid workspace backup.",
                });
            }
        };
        reader.readAsText(file);
    }
    
    const handleSaveBackupSchedule = () => {
        toast({
            title: "Schedule Saved",
            description: `Automatic backups are now set to run ${backupFrequency}.`
        })
    }
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadType) return;

        try {
            const data = await parseCsv(file);
            console.log(`Parsed data for ${uploadType}:`, data);
            
            // Placeholder: In a real app, you would now send this data to a state manager or API
            // to update the application's state. For now, we'll just show a success message.
            toast({
                title: `${uploadType} Data Imported`,
                description: `Successfully parsed ${data.length} rows. Check the console for the data.`,
            });

        } catch (error) {
            console.error("CSV Parsing Error:", error);
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: "There was an error parsing the CSV file. Please check the file format and try again.",
            });
        }

        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setUploadType(null);
    };

    const triggerFileUpload = (type: string) => {
        setUploadType(type);
        fileInputRef.current?.click();
    };

    const handleDownloadOrdersTemplate = () => {
        downloadCSV("orders_template", 
            ["orderNumber", "projectCode", "customerName", "orderDate", "deadline", "status", "items", "priority", "printerTech", "salesPerson", "notes", "imageUrl"],
            [
                ["ORD-111", "PROJ-101", "Innovate LLC", "2024-08-01", "2024-08-15", "pending", "5", "medium", "FDM", "John Smith", "Urgent prototype", "http://example.com/image1.png"],
                ["ORD-112", "PROJ-102", "Design Co.", "2024-08-02", "2024-08-20", "pending", "10", "high", "SLA", "Sarah Johnson", "Handle with care", "http://example.com/image2.png"]
            ]
        );
    };

    const handleDownloadPrintersTemplate = () => {
        downloadCSV("printers_template",
            ["name", "model", "codeName", "location", "technology", "initializationDate", "capacity", "defaultMaterial"],
            [
                ["Prusa i3 MK3S+", "i3 MK3S+", "PRUSA01", "Lab 1", "FDM", "2024-01-15", "Standard", "PLA"],
                ["Formlabs Form 3+", "Form 3+", "FORM01", "Clean Room", "SLA", "2023-11-20", "Standard", "Standard Resin"]
            ]
        );
    };

    const handleDownloadRawMaterialsTemplate = () => {
        downloadCSV("raw_materials_template",
            ["type", "spoolId_or_resinId_or_powderId", "name", "brand", "material_or_type", "color", "finish", "weight_or_volume", "price", "currency", "purchaseDate", "minStock", "minOrder", "location", "notes", "imageUrl"],
            [
                ["spool", "SP001", "PLA+ Black", "eSun", "PLA", "#000000", "Matte", "1000", "25.99", "USD", "2024-05-01", "5", "10", "Rack A-1", "Main stock filament", "http://example.com/spool.png"],
                ["resin", "RS001", "Standard Resin Grey", "Elegoo", "Standard", "#808080", "", "1000", "35.50", "USD", "2024-03-10", "2", "4", "Resin Cabinet", "General purpose", ""],
                ["powder", "PW001", "PA12 White", "EOS", "PA12", "", "", "20", "1200", "EUR", "2024-02-20", "2", "2", "Powder Station", "High performance nylon", ""]
            ]
        );
    };

    const handleDownloadInventoryTemplate = () => {
        downloadCSV("inventory_template",
            ["barcode", "name", "description", "category", "quantity", "minStock", "minOrder", "location", "imageUrl"],
            [
                ["PACK-BOX-SML", "Packing Boxes (Small)", "10x10x10cm cardboard boxes", "Packing Material", "120", "20", "50", "Shelf B-3", "http://example.com/box.png"],
                ["ELEC-STEP-N17", "NEMA 17 Stepper Motor", "Standard stepper for printers", "Electronics", "50", "10", "20", "Drawer E-1", "http://example.com/motor.png"]
            ]
        );
    };
    
    const handleDownloadCustomersTemplate = () => {
         downloadCSV("customers_template",
            ["customerCode", "name", "email", "phone", "address", "company", "taxId"],
            [
                ["CUST-01", "Innovate LLC", "contact@innovate.com", "555-123-4567", "123 Tech Park, Silicon Valley, CA 94043", "Innovate LLC", "TAX-123"],
                ["CUST-02", "Jane Doe", "jane.doe@email.com", "555-555-5555", "456 Maker St, Apt 2B, Brooklyn, NY 11221", "", ""]
            ]
         );
    };

    const handleGenerateKey = () => {
        const newKey = `pryysm_sk_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;
        setApiKey(newKey);
        toast({ title: 'API Key Generated', description: 'Make sure to copy your new key. You won\'t be able to see it again.' });
    };

    const handleCopyKey = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            toast({ title: 'API Key Copied', description: 'The key has been copied to your clipboard.' });
        }
    };

    const handleRevokeKey = () => {
        setApiKey(null);
        toast({ title: 'API Key Revoked', variant: 'destructive' });
    };

    const handlePermissionChange = (permission: keyof typeof permissions, value: boolean) => {
        setPermissions(prev => ({...prev, [permission]: value}));
    }

    const handleSavePermissions = () => {
        toast({ title: 'Permissions Updated', description: 'API key permissions have been saved.' });
    }

    const handleSendSupportMessage = () => {
        if (!supportSubject || !supportMessage) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a subject and write a message.' });
            return;
        }
        addSupportTicket({
            id: `ticket-${Date.now()}`,
            user: user!,
            subject: supportSubject,
            message: supportMessage,
            status: 'Open',
            createdAt: new Date().toISOString(),
        });
        toast({ title: 'Message Sent!', description: 'Thank you for your feedback. We will get back to you shortly.' });
        setSupportSubject('');
        setSupportMessage('');
    };

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
             <input type="file" ref={workspaceImportRef} onChange={handleImportWorkspace} className="hidden" accept=".json" />
             <input type="file" ref={profileImageRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <Settings className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your account and application settings.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-primary"/>
                                <CardTitle>Profile</CardTitle>
                            </div>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-4">
                                    <Label>Profile Picture</Label>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={profile.avatar} alt={profile.name} />
                                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <Button type="button" variant="outline" onClick={() => profileImageRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4"/>
                                            Upload Image
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={profile.name} onChange={e => handleProfileChange('name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" value={profile.email} onChange={e => handleProfileChange('email', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">Update Profile</Button>
                                </div>
                            </form>
                        </CardContent>
                         <CardHeader>
                            <CardTitle className="text-base">Change Password</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" value={profile.currentPassword} onChange={e => handleProfileChange('currentPassword', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" value={profile.newPassword} onChange={e => handleProfileChange('newPassword', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">Update Password</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                     {/* Code Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <PenLine className="h-5 w-5 text-primary"/>
                                <CardTitle>Code & ID Settings</CardTitle>
                            </div>
                            <CardDescription>Customize the prefixes for auto-generated codes across the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {(Object.keys(codeSettings) as Array<keyof CodeSettings>).map((key) => (
                                    <div className="space-y-2" key={key}>
                                        <Label htmlFor={`code-${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                                        <Input
                                            id={`code-${key}`}
                                            value={codeSettings[key]}
                                            onChange={(e) => handleCodeSettingChange(key, e.target.value)}
                                            placeholder={initialCodeSettings[key]}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveCodeSettings} className="ml-auto">Save Code Settings</Button>
                        </CardFooter>
                    </Card>


                    {/* API Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <KeyRound className="h-5 w-5 text-primary"/>
                                <CardTitle>API Access & Permissions</CardTitle>
                            </div>
                            <CardDescription>Manage API keys for external integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!apiKey ? (
                                <div className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center text-center gap-4">
                                    <p className="text-sm text-muted-foreground">No active API key. Generate one to get started.</p>
                                    <Button onClick={handleGenerateKey}>Generate New API Key</Button>
                                </div>
                            ) : (
                                <div>
                                    <Label>Your API Key</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={apiKey} className="font-mono"/>
                                        <Button variant="outline" size="icon" onClick={handleCopyKey}><Copy/></Button>
                                        <Button variant="destructive" size="icon" onClick={handleRevokeKey}><Trash2/></Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Treat this key like a password. Do not share it publicly.</p>
                                </div>
                            )}

                            {apiKey && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">Permissions</h4>
                                    <div className="space-y-4 p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="readData">Read Data</Label>
                                                <p className="text-xs text-muted-foreground">Allow fetching data like orders, inventory, etc.</p>
                                            </div>
                                            <Switch id="readData" checked={permissions.readData} onCheckedChange={(c) => handlePermissionChange('readData', c)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="writeData">Write Data</Label>
                                                <p className="text-xs text-muted-foreground">Allow creating or updating data.</p>
                                            </div>
                                            <Switch id="writeData" checked={permissions.writeData} onCheckedChange={(c) => handlePermissionChange('writeData', c)}/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="manageOrders">Manage Orders</Label>
                                                <p className="text-xs text-muted-foreground">Allow management of order statuses and details.</p>
                                            </div>
                                            <Switch id="manageOrders" checked={permissions.manageOrders} onCheckedChange={(c) => handlePermissionChange('manageOrders', c)}/>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="accessFinancials">Access Financials</Label>
                                                <p className="text-xs text-muted-foreground">Allow access to financial reports and data.</p>
                                            </div>
                                            <Switch id="accessFinancials" checked={permissions.accessFinancials} onCheckedChange={(c) => handlePermissionChange('accessFinancials', c)}/>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button onClick={handleSavePermissions}>Save Permissions</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                             <div className="flex items-center gap-3">
                                <Archive className="h-5 w-5 text-primary"/>
                                <CardTitle>
                                    <a id="data-management">Data Management</a>
                                </CardTitle>
                            </div>
                            <CardDescription>Export documents, manage templates, and backup your workspace.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Data Templates */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Data Import & Export</h4>
                                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                    <p className="text-sm text-muted-foreground mb-2">Download CSV templates or upload data in bulk.</p>
                                    {[
                                        { name: 'Orders', onDownload: handleDownloadOrdersTemplate },
                                        { name: 'Printers', onDownload: handleDownloadPrintersTemplate },
                                        { name: 'Raw Materials', onDownload: handleDownloadRawMaterialsTemplate },
                                        { name: 'Inventory', onDownload: handleDownloadInventoryTemplate },
                                        { name: 'Customers', onDownload: handleDownloadCustomersTemplate },
                                    ].map(template => (
                                        <div key={template.name} className="flex justify-between items-center bg-background p-2 rounded-md">
                                            <span className="text-sm font-medium">{template.name}</span>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => triggerFileUpload(template.name)}>
                                                    <FileUp className="mr-2 h-4 w-4"/>Upload
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={template.onDownload}>
                                                    <FileDown className="mr-2 h-4 w-4"/>Template
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Workspace Backup */}
                             <div>
                                <h4 className="font-semibold text-foreground mb-2">Workspace Backup & Restore</h4>
                                 <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <p className="text-sm text-muted-foreground">Export all workspace data (customers, orders, inventory) into a single file.</p>
                                        <Button variant="secondary" onClick={handleExportWorkspace}><Upload className="mr-2 h-4 w-4"/>Export Workspace</Button>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <p className="text-sm text-muted-foreground">Restore workspace from a backup file. <span className="font-semibold text-destructive">This will overwrite current data.</span></p>
                                        <Button variant="destructive" onClick={() => workspaceImportRef.current?.click()}><RotateCw className="mr-2 h-4 w-4"/>Import Workspace</Button>
                                    </div>
                                </div>
                            </div>
                             {/* Automated Backup */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Automated Backups</h4>
                                <div className="p-4 bg-muted/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <p className="text-sm text-muted-foreground">Set the frequency for automatic server-side backups.</p>
                                    <div className="flex gap-2">
                                        <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleSaveBackupSchedule}>Save Schedule</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                     {/* Subscription */}
                     <Card>
                        <CardHeader>
                             <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-primary"/>
                                <CardTitle>Subscription</CardTitle>
                            </div>
                            <CardDescription>Manage your billing and subscription details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-muted/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <p className="font-semibold">Pro Plan</p>
                                    <p className="text-sm text-muted-foreground">Your plan renews on August 1, 2024.</p>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href="/subscribe?plan=pro">Manage</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support Form */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-primary"/>
                                <CardTitle>Support & Feedback</CardTitle>
                            </div>
                            <CardDescription>Have a suggestion or need help? Let us know.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="support-subject">Subject</Label>
                                <Select value={supportSubject} onValueChange={setSupportSubject}>
                                    <SelectTrigger id="support-subject">
                                        <SelectValue placeholder="Select a topic..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Feedback">Feedback & Suggestions</SelectItem>
                                        <SelectItem value="Bug Report">Report a Bug</SelectItem>
                                        <SelectItem value="Support">Support Request</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="support-message">Message</Label>
                                <Textarea
                                    id="support-message"
                                    placeholder="Tell us how we can help..."
                                    value={supportMessage}
                                    onChange={(e) => setSupportMessage(e.target.value)}
                                    rows={5}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSendSupportMessage} className="w-full">Send Message</Button>
                        </CardFooter>
                    </Card>


                     {/* Account Actions */}
                    <Card>
                        <CardHeader>
                             <div className="flex items-center gap-3">
                                <LogOut className="h-5 w-5 text-destructive"/>
                                <CardTitle>Account</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                             <p className="text-xs text-muted-foreground mt-2">You will be returned to the login screen.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
