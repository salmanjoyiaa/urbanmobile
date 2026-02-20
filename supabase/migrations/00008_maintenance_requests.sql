-- Create Maintenance Status Enum
CREATE TYPE maintenance_status AS ENUM ('pending', 'approved', 'completed', 'rejected');

-- Create Maintenance Requests Table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    details TEXT,
    status maintenance_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to insert a maintenance request
CREATE POLICY "Anyone can insert maintenance requests"
    ON public.maintenance_requests FOR INSERT
    WITH CHECK (true);

-- Allow admins to read all maintenance requests
CREATE POLICY "Admins can view all maintenance requests"
    ON public.maintenance_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to update maintenance requests
CREATE POLICY "Admins can update maintenance requests"
    ON public.maintenance_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete maintenance requests
CREATE POLICY "Admins can delete maintenance requests"
    ON public.maintenance_requests FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_maintenance_requests_modtime
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
