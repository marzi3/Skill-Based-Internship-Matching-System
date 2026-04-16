'use client';

import { ChevronLeft, Code, ExternalLink, Pencil, GraduationCap, Award, Building2, Sparkles, Briefcase } from 'lucide-react';
import { FaGithub, FaLinkedin, FaLink, FaEnvelope, FaPhone, FaLocationDot } from 'react-icons/fa6';

const normalizeProfileLink = (link = '') => {
	const trimmed = String(link).trim();
	if (!trimmed) return '';
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const ProfileView = ({
	user,
	personalInfo = {},
	defaultPhoneCode = '+94',
	storedProfileImage,
	storedCoverImage,
	onEditCoverImage,
	onEditProfileImage,
	skills = [],
	education = [],
	schools = [],
	projects = [],
	certifications = [],
	uploadedCertificateFiles = [],
	showAllSkills = false,
	onToggleShowAllSkills,
	showAllEducation = false,
	onToggleShowAllEducation,
	showAllSchools = false,
	onToggleShowAllSchools,
}) => {
	const displayName = personalInfo.fullName || 'Student';
	const displayDesignation = personalInfo.designation || 'Add designation';
	const displayPhone = personalInfo.phone ? `${defaultPhoneCode}${personalInfo.phone}` : 'Not set';

	return (
		<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
			<div className="h-36 relative group">
				{storedCoverImage ? (
					<img
						src={storedCoverImage}
						alt="Cover"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-600" />
				)}
				{onEditCoverImage && (
					<button
						onClick={onEditCoverImage}
						className="absolute top-2 right-2 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg p-2 flex items-center justify-center"
					>
						<Pencil size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
					</button>
				)}
			</div>

			<div className="relative -mt-12 flex justify-center pb-4">
				<div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden shadow-lg relative group">
					{storedProfileImage ? (
						<img src={storedProfileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
					) : (
						displayName.charAt(0)?.toUpperCase() || 'U'
					)}
					{onEditProfileImage && (
						<button
							onClick={onEditProfileImage}
							className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-full flex items-center justify-center"
						>
							<Pencil size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
						</button>
					)}
				</div>
			</div>

			<div className="pt-2 pb-6 px-6">
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold text-slate-900">
						{displayName}
					</h3>
					<p className="text-sm text-slate-600 mt-1">{displayDesignation}</p>
					{personalInfo.about && (
						<div className="mt-3 text-left">
							<h4 className="text-sm font-semibold text-slate-900 tracking-wide mb-1">About</h4>
							<p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
								{personalInfo.about}
							</p>
						</div>
					)}
				</div>

				<div className="mb-6">
					<h4 className="text-sm font-semibold text-slate-900 mb-3">Contact Info</h4>
					<div className="space-y-2 text-sm">
						<div className="flex items-center gap-2 text-slate-700">
							<FaEnvelope size={16} className="text-slate-600" />
							<span>{user?.email || personalInfo.email || 'Not set'}</span>
						</div>
						<div className="flex items-center gap-2 text-slate-700">
							<FaPhone size={16} className="text-slate-600" />
							<span>{displayPhone}</span>
						</div>
						<div className="flex items-center gap-2 text-slate-700">
							<FaLocationDot size={16} className="text-slate-600" />
							<span>{personalInfo.location || 'Not set'}</span>
						</div>
					</div>
				</div>

				{(personalInfo.github || personalInfo.linkedin || personalInfo.website) && (
					<div className="mb-6">
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Links</h4>
						<div className="space-y-2">
							{personalInfo.github && (
								<a
									href={normalizeProfileLink(personalInfo.github)}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
								>
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
										<FaGithub size={16} className="text-slate-900" />
									</span>
									<span className="truncate">GitHub</span>
									<ExternalLink size={14} className="ml-auto opacity-70" />
								</a>
							)}
							{personalInfo.linkedin && (
								<a
									href={normalizeProfileLink(personalInfo.linkedin)}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
								>
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
										<FaLinkedin size={16} className="text-blue-600" />
									</span>
									<span className="truncate">LinkedIn</span>
									<ExternalLink size={14} className="ml-auto opacity-70" />
								</a>
							)}
							{personalInfo.website && (
								<a
									href={normalizeProfileLink(personalInfo.website)}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
								>
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
										<FaLink size={16} className="text-slate-700" />
									</span>
									<span className="truncate">Portfolio</span>
									<ExternalLink size={14} className="ml-auto opacity-70" />
								</a>
							)}
						</div>
					</div>
				)}

				{skills.length > 0 && (
					<div>
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Skills</h4>
						<div className="flex flex-wrap gap-2">
							{(showAllSkills ? skills : skills.slice(0, 4)).map((skill, index) => (
								<span
									key={index}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
								>
									  {index % 2 === 0 ? <Code size={13} /> : <Sparkles size={13} />}
									{skill.name}
								</span>
							))}
							{skills.length > 4 && !showAllSkills && onToggleShowAllSkills && (
								<button
									onClick={onToggleShowAllSkills}
									className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
								>
									  <Sparkles size={12} /> +{skills.length - 4} more
								</button>
							)}
							{skills.length > 4 && showAllSkills && onToggleShowAllSkills && (
								<button
									onClick={onToggleShowAllSkills}
									className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
								>
									<ChevronLeft size={12} /> Show less
								</button>
							)}
						</div>
					</div>
				)}

				{education.length > 0 && (
					<div className="mt-6">
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Education</h4>
						<div className="space-y-2">
							{(showAllEducation ? education : education.slice(0, 2)).map((edu, index) => (
								<div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
									<GraduationCap size={16} className="text-black flex-shrink-0 mt-0.5" />
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-blue-900">{edu.degree}</p>
										<p className="text-xs text-blue-700">{edu.institution}</p>
									</div>
								</div>
							))}
							{education.length > 2 && !showAllEducation && onToggleShowAllEducation && (
								<button
									onClick={onToggleShowAllEducation}
									className="text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer underline"
								>
									+{education.length - 2} more
								</button>
							)}
							{education.length > 2 && showAllEducation && onToggleShowAllEducation && (
								<button
									onClick={onToggleShowAllEducation}
									className="text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer underline"
								>
									Show less
								</button>
							)}
						</div>
					</div>
				)}

				{schools.length > 0 && (
					<div className="mt-6">
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Schools</h4>
						<div className="space-y-2">
							{(showAllSchools ? schools : schools.slice(0, 2)).map((school, index) => (
								<div key={index} className="flex items-start gap-2 p-2 bg-stone-50 rounded-lg border border-stone-100 hover:border-stone-200 transition-colors">
									<Building2 size={16} className="text-stone-600 flex-shrink-0 mt-0.5" />
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-stone-900">{school.school}</p>
										<p className="text-xs text-stone-700">{new Date(school.addedAt).toLocaleDateString()}</p>
									</div>
								</div>
							))}
							{schools.length > 2 && !showAllSchools && onToggleShowAllSchools && (
								<button
									onClick={onToggleShowAllSchools}
									className="text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer underline"
								>
									+{schools.length - 2} more
								</button>
							)}
							{schools.length > 2 && showAllSchools && onToggleShowAllSchools && (
								<button
									onClick={onToggleShowAllSchools}
									className="text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer underline"
								>
									Show less
								</button>
							)}
						</div>
					</div>
				)}

				{certifications.length > 0 && (
					<div className="mt-6">
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Online Certifications</h4>
						<div className="grid grid-cols-2 gap-2">
							{certifications.slice(0, 3).map((cert, index) => (
								<div key={index} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100 hover:border-amber-200 transition-colors">
									<Award size={16} className="text-amber-600 flex-shrink-0" />
									<a
										href={cert.credentialUrl?.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex-1 min-w-0"
									>
										<p className="text-xs font-medium text-amber-900 truncate hover:text-amber-700 transition-colors">{cert.name}</p>
										<p className="text-xs text-amber-700">{new Date(cert.issuedDate).toLocaleDateString()}</p>
									</a>
									<ExternalLink size={12} className="text-amber-600 flex-shrink-0" />
								</div>
							))}
							{certifications.length > 3 && (
								<p className="text-xs text-slate-600 mt-1 col-span-2">+{certifications.length - 3} more certification{certifications.length - 3 > 1 ? 's' : ''}</p>
							)}
						</div>
					</div>
				)}

				{uploadedCertificateFiles.length > 0 && (
					<div className="mt-6">
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Uploaded Certificates</h4>
						<div className="grid grid-cols-2 gap-2">
							{uploadedCertificateFiles.slice(0, 3).map((file, index) => (
								<div key={index} className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg border border-cyan-100 hover:border-cyan-200 transition-colors">
									<a
										href={file.filePath}
										target="_blank"
										rel="noopener noreferrer"
										className="flex-1 min-w-0"
									>
										<p className="text-xs font-medium text-cyan-900 truncate hover:text-cyan-700 transition-colors">
											{file.title || file.fileName}
										</p>
										<p className="text-xs text-cyan-700">
											{new Date(file.uploadedAt).toLocaleDateString()}
										</p>
									</a>
									<ExternalLink size={12} className="text-cyan-600 flex-shrink-0" />
								</div>
							))}
							{uploadedCertificateFiles.length > 3 && (
								<p className="text-xs text-slate-600 mt-1 col-span-2">
									+{uploadedCertificateFiles.length - 3} more uploaded certificate{uploadedCertificateFiles.length - 3 > 1 ? 's' : ''}
								</p>
							)}
						</div>
					</div>
				)}

				{projects.length > 0 && (
					<div className="mt-6">
						<h4 className="text-sm font-semibold text-slate-900 mb-3">Projects</h4>
						<div className="space-y-2">
							{projects.slice(0, 3).map((project, index) => (
								<div key={project._id || index} className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 hover:border-indigo-200 transition-colors">
									<div className="flex items-start gap-2">
										<Briefcase size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-semibold text-indigo-900 truncate">{project.title || 'Untitled Project'}</p>
											{project.description && (
												<p className="text-xs text-indigo-700 mt-1 line-clamp-2">{project.description}</p>
											)}
											<div className="flex items-center gap-2 mt-1.5">
												{project.repositoryUrl && (
													<a
														href={normalizeProfileLink(project.repositoryUrl)}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
													>
														<FaGithub size={13} />
														Repo
													</a>
												)}
												{project.liveUrl && (
													<a
														href={normalizeProfileLink(project.liveUrl)}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
													>
														<ExternalLink size={13} />
														Live
													</a>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
							{projects.length > 3 && (
								<p className="text-xs text-slate-600 mt-1">+{projects.length - 3} more projects</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfileView;
