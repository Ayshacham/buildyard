'use client';

import { useParams } from 'next/navigation';

import { ProjectDetailView } from '@/components/projects/project-detail-view';

export default function ProjectDetailPage() {
	const params = useParams();
	const projectId = params.projectId;
	const id = typeof projectId === 'string' ? projectId : '';

	if (!id) {
		return null;
	}

	return <ProjectDetailView projectId={id} />;
}
