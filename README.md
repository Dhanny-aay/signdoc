# signdoc 4.0 - Full-Canvas, Toolbar-Driven Document Signing System

A revolutionary document signing application built with Next.js, featuring a full-canvas workspace, top toolbar interface, and smooth signature interactions with Perfect Freehand technology.

## ✨ **New in signdoc 4.0**

- **🎨 Full-Canvas Workspace**: Maximum document viewing space with top toolbar design
- **✍️ Perfect Freehand**: Advanced stroke rendering for natural, smooth signature drawing
- **🎯 Smooth Drag & Drop**: RequestAnimationFrame-based transforms for buttery-smooth interactions
- **📱 Premium Typed Signatures**: 8 beautiful Google Fonts with customizable size and color
- **📄 Full PDF Rendering**: Complete document viewing with React PDF, zoom controls, and navigation
- **↩️ Undo/Redo System**: Comprehensive history management for all signature operations
- **🔄 Floating Signature Panel**: Non-intrusive signature creation that doesn't block your view

## 🚀 **Features**

### **User Authentication**
- Supabase Auth with email/password
- Social login (Google, GitHub)
- Secure session management

### **Document Management**
- Upload PDFs to Cloudinary
- Store metadata in Supabase
- Status tracking (Ready, Signed, Archived)
- Search and filter capabilities

### **Full-Canvas Signing Interface**
- **Top Toolbar**: Centralized controls for signature tools, zoom, and document operations
- **Maximum Workspace**: Full-canvas PDF viewing without side panels
- **Floating Panels**: Signature creation tools appear when needed, disappear when done
- **Responsive Design**: Optimized for all screen sizes and devices

### **Advanced Signature System**
- **Drawn Signatures**: Natural drawing with Perfect Freehand
- **Typed Signatures**: Premium fonts with customization
- **Interactive Placement**: Drag, drop, resize, and rotate signatures
- **Real-time Preview**: See changes instantly with smooth transforms

### **Enhanced PDF Handling**
- Full document rendering with React PDF
- Multi-page support with navigation
- Zoom controls (50% - 300%)
- Fit to screen and actual size options
- Signature overlay system

## 🛠 **Tech Stack**

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **File Storage**: Cloudinary
- **Signature Drawing**: Perfect Freehand
- **PDF Rendering**: React PDF
- **Performance**: RequestAnimationFrame for smooth transforms
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Fonts**: Manrope + Google Fonts

## 📦 **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd signdoc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Enable Authentication (Email, Google, GitHub)
   - Create the `documents` table:
   ```sql
   create table if not exists public.documents (
     id uuid primary key default gen_random_uuid(),
     owner_uid uuid not null references auth.users(id),
     file_name text not null,
     url text not null,
     status text not null default 'ready',
     signature_data_url text,
     signature_position jsonb,
     created_at timestamp with time zone default now()
   );
   
   -- Enable RLS
   alter table public.documents enable row level security;
   
   -- Create policies
   create policy "users can read own documents" 
     on public.documents for select 
     to authenticated using (owner_uid = auth.uid());
   
   create policy "users can insert own documents" 
     on public.documents for insert 
     to authenticated with check (owner_uid = auth.uid());
   
   create policy "users can update own documents" 
     on public.documents for update 
     to authenticated using (owner_uid = auth.uid());
   ```

5. **Set up Cloudinary**
   - Create a Cloudinary account
   - Get your cloud name and upload preset
   - Configure upload preset for unsigned uploads

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🎯 **Available Routes**

- **`/`** - Landing page showcasing full-canvas signing
- **`/login`** - Authentication (login/signup)
- **`/dashboard`** - Document management dashboard
- **`/upload`** - PDF upload interface
- **`/sign/[id]`** - Full-canvas signature creation and placement

## 🎨 **Signature Creation Workflow**

### **1. Toolbar Interface**
- Use the top toolbar to select signature tools
- Choose between Draw and Type methods
- Access zoom controls, undo/redo, and download options

### **2. Create Signatures**
- **Draw**: Use Perfect Freehand for natural drawing
- **Type**: Select from 8 premium Google Fonts
- **Floating Panel**: Tools appear when needed, don't block your view

### **3. Place & Position**
- Drag and drop signatures anywhere on the full-canvas PDF
- Resize using blue handles
- Rotate using green rotation handles
- Smooth, responsive interactions with requestAnimationFrame

### **4. Save & Export**
- Save document with embedded signatures
- Download final PDF with perfect positioning preserved
- Full undo/redo history for all operations

## 🔧 **Development**

### **Key Components**
- `SignatureToolbar.jsx` - Top toolbar with all controls
- `FloatingSignaturePanel.jsx` - Non-intrusive signature creation
- `EnhancedDraggableSignature.jsx` - Smooth signature interactions
- `SignatureCanvas.jsx` - Perfect Freehand drawing interface
- `TypedSignature.jsx` - Font-based signature creation

### **State Management**
- React hooks (`useState`, `useContext`, `useCallback`)
- Comprehensive history tracking for undo/redo
- Supabase real-time subscriptions
- Local state for signature data and positions

### **Performance Optimizations**
- RequestAnimationFrame for smooth transforms
- Debounced updates to prevent layout thrashing
- Optimized re-renders with useCallback
- Efficient signature positioning and updates

### **Styling**
- Tailwind CSS with custom variables
- Responsive design system
- Consistent spacing and typography
- Smooth transitions and animations

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### **Other Platforms**
- Build: `npm run build`
- Start: `npm start`
- Ensure environment variables are set

## 📱 **Responsiveness**

- Mobile-first design approach
- Touch-friendly signature creation
- Responsive PDF viewer
- Adaptive layout for all screen sizes
- Floating panels that work on mobile

## 🔒 **Security Features**

- Row Level Security (RLS) in Supabase
- Authenticated API routes
- Secure file uploads
- Session management
- CORS protection

## 🎉 **What's Next**

- **PDF Embedding**: Save signatures directly into PDF files
- **Batch Signing**: Sign multiple documents at once
- **Team Collaboration**: Share documents for team review
- **Advanced Analytics**: Document signing insights
- **API Integration**: Connect with external services
- **Real-time Collaboration**: Multi-user signing sessions

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, Perfect Freehand, and Supabase**
