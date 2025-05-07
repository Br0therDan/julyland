// path: src/utils/formatName.js

export const formatName = (name) => {
  if (!name) return name // 이름이 없을 경우 빈 문자열 반환

  // 한글 여부 확인
  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name)

  if (isKorean) {
    return name[0] // 한글일 경우 성만 반환
  } else {
    // 영어일 경우 이름과 성의 첫 글자를 대문자로
    const [firstName, lastName] = name.split(' ')
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : ''
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ''
    return `${firstInitial}${lastInitial}`
  }
}

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
