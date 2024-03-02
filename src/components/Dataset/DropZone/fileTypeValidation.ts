const matchesType = (file: File, type: string) => {
  const [category, extension] = type.split('/')
  return extension === '*'
    ? file.type.split('/')[0] === category
    : file.type === type
}

const matchesExtension = (file: File, supportedExtensions: string[]) => {
  const ending =
    file.name.endsWith('.nii.gz')
      ? '.nii.gz'
      : file.name.substr(file.name.lastIndexOf('.')).toLowerCase()
  return supportedExtensions.includes(ending)
}

const isAccepted = (file: File, acceptedFileTypes: string[]) =>
  acceptedFileTypes.some(type => matchesType(file, type)) ||
  matchesExtension(file, acceptedFileTypes)

export const validateFileListTypes = (list: FileList | File[], acceptedFileTypes: string[]) => {
  return Array.from(list).every((file) => isAccepted(file, acceptedFileTypes))
}
